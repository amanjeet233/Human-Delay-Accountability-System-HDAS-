package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.process.Process;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.request.Request;
import com.hdas.domain.sla.SLA;
import com.hdas.domain.user.User;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestService {
    
    private final RequestRepository requestRepository;
    private final ProcessRepository processRepository;
    private final UserRepository userRepository;
    private final ProcessStepRepository processStepRepository;
    private final AssignmentRepository assignmentRepository;
    private final SLARepository slaRepository;
    private final DelayRepository delayRepository;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    private final EscalationService escalationService;
    private final SLAExclusionRuleRepository slaExclusionRuleRepository;
    
    @Transactional
    public Request createRequest(UUID processId, String title, String description, HttpServletRequest httpRequest) {
        Process process = processRepository.findById(processId)
            .orElseThrow(() -> new RuntimeException("Process not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User creator = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Request request = Request.builder()
            .process(process)
            .createdBy(creator)
            .title(title)
            .description(description)
            .status("PENDING")
            .startedAt(Instant.now())
            .build();
        
        request = requestRepository.save(request);
        
        List<ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(processId);
        if (!steps.isEmpty()) {
            ProcessStep firstStep = steps.get(0);
            createAssignment(request, firstStep, creator.getId(), httpRequest);
        }
        
        auditService.logWithRequest("CREATE_REQUEST", "Request", request.getId(), 
            null, request.getStatus(), "Request created: " + title, httpRequest);
        
        return request;
    }
    
    @Transactional
    public Assignment createAssignment(Request request, ProcessStep step, UUID assignedById, HttpServletRequest httpRequest) {
        User assignedTo = determineAssignee(step, assignedById);
        
        Long allowedDuration = determineSlaDuration(step, assignedTo, httpRequest);
        
        Assignment assignment = Assignment.builder()
            .request(request)
            .processStep(step)
            .assignedTo(assignedTo)
            .assignedById(assignedById)
            .status("PENDING")
            .assignedAt(Instant.now())
            .allowedDurationSeconds(allowedDuration)
            .build();
        
        assignment = assignmentRepository.save(assignment);
        
        auditService.logWithRequest("CREATE_ASSIGNMENT", "Assignment", assignment.getId(),
            null, assignment.getStatus(), "Assignment created for step: " + step.getName(), httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Assignment startAssignment(UUID assignmentId, HttpServletRequest httpRequest) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        if (!"PENDING".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment cannot be started");
        }
        
        assignment.setStatus("IN_PROGRESS");
        assignment.setStartedAt(Instant.now());
        assignment = assignmentRepository.save(assignment);
        
        auditService.logWithRequest("START_ASSIGNMENT", "Assignment", assignmentId,
            "PENDING", "IN_PROGRESS", "Assignment started", httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Assignment completeAssignment(UUID assignmentId, String action, String notes, HttpServletRequest httpRequest) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        if (!"IN_PROGRESS".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment is not in progress");
        }
        
        Instant completedAt = Instant.now();
        assignment.setCompletedAt(completedAt);
        assignment.setNotes(notes);
        
        if (assignment.getStartedAt() != null && assignment.getAllowedDurationSeconds() != null) {
            Duration actualDuration = Duration.between(assignment.getStartedAt(), completedAt);
            assignment.setActualDurationSeconds(actualDuration.getSeconds());
            
            if (actualDuration.getSeconds() > assignment.getAllowedDurationSeconds()) {
                long delaySeconds = actualDuration.getSeconds() - assignment.getAllowedDurationSeconds();
                createDelay(assignment, delaySeconds, "SLA breach detected", httpRequest);
            }
        }

        // Check for escalation if feature is enabled (runtime via DB)
        if (featureFlagService.isFeatureEnabled("escalation") && featureFlagService.isFeatureEnabled("autoEscalationEngine")) {
            escalationService.checkAndEscalate(assignment, httpRequest);
        }
        
        if ("APPROVE".equals(action)) {
            assignment.setStatus("APPROVED");
            moveToNextStep(assignment, httpRequest);
        } else if ("REJECT".equals(action)) {
            assignment.setStatus("REJECTED");
            assignment.getRequest().setStatus("REJECTED");
        } else if ("FORWARD".equals(action)) {
            assignment.setStatus("FORWARDED");
        }
        
        assignment = assignmentRepository.save(assignment);
        
        auditService.logWithRequest("COMPLETE_ASSIGNMENT", "Assignment", assignmentId,
            "IN_PROGRESS", assignment.getStatus(), "Assignment completed with action: " + action, httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Delay createDelay(Assignment assignment, long delaySeconds, String reason, HttpServletRequest httpRequest) {
        Delay delay = Delay.builder()
            .assignment(assignment)
            .responsibleUser(assignment.getAssignedTo())
            .delaySeconds(delaySeconds)
            .reason(reason)
            .detectedAt(Instant.now())
            .justified(false)
            .isShadowDelay(false)
            .build();
        
        delay = delayRepository.save(delay);
        
        auditService.logWithRequest("CREATE_DELAY", "Delay", delay.getId(),
            null, String.valueOf(delaySeconds), "Delay detected: " + reason, httpRequest);
        
        return delay;
    }
    
    private User determineAssignee(ProcessStep step, UUID assignedById) {
        if (step.getResponsibleRole() != null) {
            // Find users with the specified role
            List<User> usersWithRole = userRepository.findAll().stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()) && user.getRoles().stream()
                    .anyMatch(role -> Boolean.TRUE.equals(role.getActive()) && step.getResponsibleRole().equals(role.getName())))
                .toList();
            
            if (!usersWithRole.isEmpty()) {
                // Return first active user with the role, or fallback to creator
                return usersWithRole.get(0);
            }
        }
        // Fallback to the user who created the request
        return userRepository.findById(assignedById)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private Long determineSlaDuration(ProcessStep step, User user, HttpServletRequest httpRequest) {
        Long baseDuration = null;
        
        if (step.getDefaultSlaDurationSeconds() != null) {
            baseDuration = step.getDefaultSlaDurationSeconds();
        } else {
            List<SLA> slas = slaRepository.findByProcessStepId(step.getId());
            for (SLA sla : slas) {
                if (sla.getRoleId() != null && user.getRoles().stream()
                    .anyMatch(role -> role.getId().equals(sla.getRoleId()))) {
                    baseDuration = sla.getAllowedDurationSeconds();
                    break;
                }
            }
        }
        
        if (baseDuration == null) {
            baseDuration = 86400L; // Default 24 hours
        }
        
        // Apply SLA exclusion rules if governance module is enabled
        if (featureFlagService.isFeatureEnabled("governanceAnalysis") && step.getId() != null) {
            java.time.Instant now = java.time.Instant.now();
            List<com.hdas.domain.governance.SLAExclusionRule> exclusions = slaExclusionRuleRepository.findActiveRulesForInstant(now);
            if (!exclusions.isEmpty()) {
                boolean appliesToStep = exclusions.stream()
                        .anyMatch(e -> e.getProcessStep() != null && e.getProcessStep().getId().equals(step.getId()));
                if (appliesToStep) {
                    long totalExclusionSeconds = exclusions.stream()
                            .mapToLong(e -> java.time.Duration.between(e.getExclusionStart(), e.getExclusionEnd()).getSeconds())
                            .sum();
                    baseDuration += totalExclusionSeconds / exclusions.size();
                }
            }
        }
        
        return baseDuration;
    }
    
    private void moveToNextStep(Assignment completedAssignment, HttpServletRequest httpRequest) {
        Request request = completedAssignment.getRequest();
        ProcessStep currentStep = completedAssignment.getProcessStep();
        
        List<ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(
            request.getProcess().getId());
        
        int currentIndex = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getId().equals(currentStep.getId())) {
                currentIndex = i;
                break;
            }
        }
        
        if (currentIndex >= 0 && currentIndex < steps.size() - 1) {
            ProcessStep nextStep = steps.get(currentIndex + 1);
            createAssignment(request, nextStep, completedAssignment.getAssignedTo().getId(), httpRequest);
        } else {
            request.setStatus("COMPLETED");
            request.setCompletedAt(Instant.now());
            requestRepository.save(request);
        }
    }
    
    public List<com.hdas.dto.RequestTimelineItem> getRequestTimeline(UUID requestId) {
        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        List<com.hdas.dto.RequestTimelineItem> timeline = new ArrayList<>();
        
        // Add request creation
        timeline.add(com.hdas.dto.RequestTimelineItem.builder()
            .timestamp(request.getCreatedAt())
            .eventType("REQUEST_CREATED")
            .description("Request created: " + request.getTitle())
            .user(request.getCreatedBy().getUsername())
            .build());
        
        // Add assignments
        List<Assignment> assignments = assignmentRepository.findByRequestId(requestId);
        for (Assignment assignment : assignments) {
            timeline.add(com.hdas.dto.RequestTimelineItem.builder()
                .timestamp(assignment.getAssignedAt())
                .eventType("ASSIGNMENT_CREATED")
                .description("Assigned to " + assignment.getAssignedTo().getUsername() + " for step: " + assignment.getProcessStep().getName())
                .user(assignment.getAssignedTo().getUsername())
                .build());
            
            if (assignment.getStartedAt() != null) {
                timeline.add(com.hdas.dto.RequestTimelineItem.builder()
                    .timestamp(assignment.getStartedAt())
                    .eventType("ASSIGNMENT_STARTED")
                    .description("Started working on: " + assignment.getProcessStep().getName())
                    .user(assignment.getAssignedTo().getUsername())
                    .build());
            }
            
            if (assignment.getCompletedAt() != null) {
                timeline.add(com.hdas.dto.RequestTimelineItem.builder()
                    .timestamp(assignment.getCompletedAt())
                    .eventType("ASSIGNMENT_COMPLETED")
                    .description("Completed: " + assignment.getProcessStep().getName() + " - Status: " + assignment.getStatus())
                    .user(assignment.getAssignedTo().getUsername())
                    .build());
            }
        }
        
        if (request.getCompletedAt() != null) {
            timeline.add(com.hdas.dto.RequestTimelineItem.builder()
                .timestamp(request.getCompletedAt())
                .eventType("REQUEST_COMPLETED")
                .description("Request completed with status: " + request.getStatus())
                .build());
        }
        
        timeline.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
        return timeline;
    }

    // Read operations for controllers
    public java.util.List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public java.util.Optional<Request> getRequestById(UUID id) {
        return requestRepository.findById(id);
    }

    public java.util.List<Request> getRequestsByCreatorUsername(String username) {
        var user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByCreatedById(user.getId());
    }

    public java.util.List<Assignment> getAssignmentsByRequest(UUID requestId) {
        return assignmentRepository.findByRequestId(requestId);
    }
}
