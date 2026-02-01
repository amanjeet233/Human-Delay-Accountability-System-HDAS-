package com.hdas.scheduler;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.escalation.EscalationHistory;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.user.Role;
import com.hdas.repository.AssignmentRepository;
import com.hdas.repository.EscalationHistoryRepository;
import com.hdas.repository.ProcessStepRepository;
import com.hdas.repository.RoleRepository;
import com.hdas.service.AdminNotificationService;
import com.hdas.service.DelayCalculationService;
import com.hdas.service.RequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class AutoEscalationScheduler {

    private static final long SCHEDULE_INTERVAL_SECONDS = 3600L;

    private final AssignmentRepository assignmentRepository;
    private final ProcessStepRepository processStepRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final RoleRepository roleRepository;
    private final DelayCalculationService delayCalculationService;
    private final RequestService requestService;
    private final AdminNotificationService adminNotificationService;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void runHourlyAutoEscalation() {
        Instant now = Instant.now();
        List<Assignment> inProgress = assignmentRepository.findByStatus("IN_PROGRESS");

        for (Assignment assignment : inProgress) {
            try {
                if (assignment.getStartedAt() == null) {
                    continue;
                }

                long overdueSeconds = delayCalculationService.calculateCurrentOverdueSeconds(assignment, now);
                if (overdueSeconds <= 0) {
                    continue;
                }

                if (wasRecentlyEscalated(assignment, now)) {
                    continue;
                }

                ProcessStep nextStep = resolveNextStep(assignment);
                if (nextStep == null) {
                    continue;
                }

                assignment.setStatus("ESCALATED");
                assignment.setCompletedAt(now);
                assignment.setNotes("Auto escalated due to SLA breach. Overdue seconds=" + overdueSeconds);
                assignmentRepository.save(assignment);

                var newAssignment = requestService.createAssignment(assignment.getRequest(), nextStep, null, null);

                EscalationHistory history = EscalationHistory.builder()
                    .assignment(assignment)
                    .escalatedFromUserId(assignment.getAssignedTo() != null ? assignment.getAssignedTo().getId() : null)
                    .escalatedToUserId(newAssignment.getAssignedTo() != null ? newAssignment.getAssignedTo().getId() : null)
                    .escalatedToRoleId(resolveRoleId(nextStep))
                    .reason("SLA exceeded by " + overdueSeconds + " seconds")
                    .escalatedAt(now)
                    .build();
                escalationHistoryRepository.save(Objects.requireNonNull(history));

                adminNotificationService.notifyAdmins(
                    assignment.getRequest() != null ? assignment.getRequest().getId() : null,
                    assignment.getId(),
                    "Auto escalated request to role: " + nextStep.getResponsibleRole()
                );

                log.info("Auto escalated assignment {} to role {} (overdueSeconds={})",
                    assignment.getId(), nextStep.getResponsibleRole(), overdueSeconds);
            } catch (Exception ex) {
                log.error("Auto escalation failed for assignment {}", assignment.getId(), ex);
            }
        }
    }

    private boolean wasRecentlyEscalated(Assignment assignment, Instant now) {
        Optional<EscalationHistory> last = escalationHistoryRepository
            .findTopByAssignmentIdOrderByEscalatedAtDesc(assignment.getId());
        if (last.isEmpty()) {
            return false;
        }
        Duration sinceLast = Duration.between(last.get().getEscalatedAt(), now);
        return sinceLast.getSeconds() < SCHEDULE_INTERVAL_SECONDS;
    }

    private ProcessStep resolveNextStep(Assignment assignment) {
        if (assignment.getRequest() == null || assignment.getRequest().getProcess() == null) {
            return null;
        }
        if (assignment.getProcessStep() == null || assignment.getProcessStep().getId() == null) {
            return null;
        }
        List<ProcessStep> steps = processStepRepository
            .findByProcessIdOrderBySequenceOrderAsc(assignment.getRequest().getProcess().getId());
        int currentIndex = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getId().equals(assignment.getProcessStep().getId())) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex >= 0 && currentIndex < steps.size() - 1) {
            ProcessStep next = steps.get(currentIndex + 1);
            if (next.getResponsibleRole() == null || next.getResponsibleRole().isBlank()) {
                return null;
            }
            return next;
        }
        return null;
    }

    private java.util.UUID resolveRoleId(ProcessStep nextStep) {
        if (nextStep == null || nextStep.getResponsibleRole() == null) {
            return null;
        }
        Optional<Role> role = roleRepository.findByName(nextStep.getResponsibleRole());
        return role.map(Role::getId).orElse(null);
    }
}
