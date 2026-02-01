package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.sla.SLA;
import com.hdas.repository.DelayRepository;
import com.hdas.repository.SLARepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DelayCalculationService {

    private final SLARepository slaRepository;
    private final DelayRepository delayRepository;

    /**
     * Calculate and persist delay for a completed assignment if SLA is breached.
     * Stores both seconds and days, and tags responsible role/user via assignment.
     */
    @SuppressWarnings("null")
    public void calculateForCompletedAssignment(@NonNull Assignment assignment) {
        Objects.requireNonNull(assignment);
        if (assignment.getStartedAt() == null || assignment.getCompletedAt() == null) {
            return; // nothing to compute
        }

        long allowed = resolveAllowedSeconds(assignment);
        long actual = Duration.between(assignment.getStartedAt(), assignment.getCompletedAt()).getSeconds();
        long delaySeconds = Math.max(0, actual - allowed);
        if (delaySeconds <= 0) {
            return; // no breach
        }

        int delayDays = (int) (delaySeconds / 86400L);
        String roleName = assignment.getProcessStep() != null ? assignment.getProcessStep().getResponsibleRole() : null;

        Delay delay = Delay.builder()
                .assignment(assignment)
                .responsibleUser(assignment.getAssignedTo())
                .responsibleRole(roleName)
                .delaySeconds(delaySeconds)
                .delayDays(delayDays)
                .reason("SLA breach: actual=" + actual + "s allowed=" + allowed + "s")
                .reasonCategory("SLA_BREACH")
                .detectedAt(Instant.now())
                .justified(false)
                .isShadowDelay(false)
                .build();
        delayRepository.save(delay);
    }

    /**
     * Calculate current overdue for an in-progress assignment at 'now'.
     * Does not persist by default; caller can persist if needed.
     */
    public long calculateCurrentOverdueSeconds(@NonNull Assignment assignment, Instant now) {
        Objects.requireNonNull(assignment);
        if (assignment.getStartedAt() == null) return 0L;
        long allowed = resolveAllowedSeconds(assignment);
        long elapsed = Duration.between(assignment.getStartedAt(), now != null ? now : Instant.now()).getSeconds();
        return Math.max(0, elapsed - allowed);
    }

    private long resolveAllowedSeconds(Assignment assignment) {
        // Prefer assignment.allowedDurationSeconds; fallback to SLA table for the step
        if (assignment.getAllowedDurationSeconds() != null) {
            return assignment.getAllowedDurationSeconds();
        }
        if (assignment.getProcessStep() != null && assignment.getProcessStep().getId() != null) {
            List<SLA> slas = slaRepository.findByProcessStepId(assignment.getProcessStep().getId());
            if (!slas.isEmpty()) {
                // Prefer SLA matching assignee role
                var userRoles = assignment.getAssignedTo() != null ? assignment.getAssignedTo().getRoles() : java.util.Set.<com.hdas.domain.user.Role>of();
                for (SLA sla : slas) {
                    if (Boolean.TRUE.equals(sla.getActive()) && sla.getRoleId() != null) {
                        boolean matches = userRoles.stream().anyMatch(r -> r.getId().equals(sla.getRoleId()));
                        if (matches) {
                            return sla.getAllowedDurationSeconds();
                        }
                    }
                }
                // Fallback: first active SLA for step
                for (SLA sla : slas) {
                    if (Boolean.TRUE.equals(sla.getActive())) {
                        return sla.getAllowedDurationSeconds();
                    }
                }
            }
        }
        // Default 24 hours if no SLA
        return 86400L;
    }
}
