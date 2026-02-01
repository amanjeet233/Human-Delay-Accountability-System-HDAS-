package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.process.Process;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.request.Request;
import com.hdas.domain.request.RequestStatusHistory;
import com.hdas.domain.request.AssignedRole;
import com.hdas.domain.sla.SLA;
import com.hdas.domain.user.User;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
    private final RequestStatusHistoryRepository requestStatusHistoryRepository;
    private final DelayCalculationService delayCalculationService;
    
    @Transactional
    public Request createRequest(@NonNull UUID processId, String title, String description, HttpServletRequest httpRequest) {
        Process process = processRepository.findById(Objects.requireNonNull(processId))
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
        
        request = requestRepository.save(Objects.requireNonNull(request));
        
        List<ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(Objects.requireNonNull(processId));
        if (!steps.isEmpty()) {
            ProcessStep firstStep = steps.get(0);
            Assignment firstAssignment = createAssignment(request, firstStep, creator.getId(), httpRequest);
            // Record initial status change NEW -> PENDING with assignee details
            AssignedRole role = mapRoleNameToAssignedRole(firstStep.getResponsibleRole());
            recordStatusChange(request, "NEW", request.getStatus(), role, firstAssignment.getAssignedTo().getId(), "Request created");
        } else {
            // No steps: still record status change without assignee
            recordStatusChange(request, "NEW", request.getStatus(), AssignedRole.CLERK, creator.getId(), "Request created");
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
        
        assignment = assignmentRepository.save(java.util.Objects.requireNonNull(assignment));
        
        auditService.logWithRequest("CREATE_ASSIGNMENT", "Assignment", assignment.getId(),
            null, assignment.getStatus(), "Assignment created for step: " + step.getName(), httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Assignment startAssignment(@NonNull UUID assignmentId, HttpServletRequest httpRequest) {
        Assignment assignment = assignmentRepository.findById(Objects.requireNonNull(assignmentId))
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        if (!"PENDING".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment cannot be started");
        }
        
        assignment.setStatus("IN_PROGRESS");
        assignment.setStartedAt(Instant.now());
        assignment = assignmentRepository.save(Objects.requireNonNull(assignment));
        
        auditService.logWithRequest("START_ASSIGNMENT", "Assignment", assignmentId,
            "PENDING", "IN_PROGRESS", "Assignment started", httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Assignment completeAssignment(@NonNull UUID assignmentId, String action, String notes, HttpServletRequest httpRequest) {
        Assignment assignment = assignmentRepository.findById(Objects.requireNonNull(assignmentId))
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
            // Centralized delay calculation & persistence
            delayCalculationService.calculateForCompletedAssignment(assignment);
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
            String previousStatus = assignment.getRequest().getStatus();
            assignment.getRequest().setStatus("REJECTED");
            recordStatusChange(
                assignment.getRequest(),
                previousStatus,
                "REJECTED",
                mapRoleNameToAssignedRole(assignment.getProcessStep().getResponsibleRole()),
                assignment.getAssignedTo().getId(),
                notes != null ? notes : "Assignment rejected"
            );
        } else if ("FORWARD".equals(action)) {
            assignment.setStatus("FORWARDED");
        }
        
        assignment = assignmentRepository.save(Objects.requireNonNull(assignment));
        
        auditService.logWithRequest("COMPLETE_ASSIGNMENT", "Assignment", assignmentId,
            "IN_PROGRESS", assignment.getStatus(), "Assignment completed with action: " + action, httpRequest);
        
        return assignment;
    }
    
    @Transactional
    public Delay createDelay(Assignment assignment, long delaySeconds, String reason, HttpServletRequest httpRequest) {
        int delayDays = (int) (delaySeconds / 86400L);
        String roleName = assignment.getProcessStep() != null ? assignment.getProcessStep().getResponsibleRole() : null;
        Delay delay = Delay.builder()
            .assignment(assignment)
            .responsibleUser(assignment.getAssignedTo())
            .responsibleRole(roleName)
            .delaySeconds(delaySeconds)
            .delayDays(delayDays)
            .reason(reason)
            .reasonCategory("SLA_BREACH")
            .detectedAt(Instant.now())
            .justified(false)
            .isShadowDelay(false)
            .build();
        
        delay = delayRepository.save(Objects.requireNonNull(delay));
        
        auditService.logWithRequest("CREATE_DELAY", "Delay", delay.getId(),
            null, String.valueOf(delaySeconds), "Delay detected: " + reason + " (days=" + delayDays + ")", httpRequest);
        
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
        // Fallback: if assignedById provided, return that user; else first active user
        if (assignedById != null) {
            return userRepository.findById(assignedById)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        return userRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active user available for assignment"));
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
            String previousStatus = request.getStatus();
            request.setStatus("COMPLETED");
            request.setCompletedAt(Instant.now());
            requestRepository.save(request);
            recordStatusChange(
                request,
                previousStatus,
                "COMPLETED",
                mapRoleNameToAssignedRole(currentStep.getResponsibleRole()),
                completedAssignment.getAssignedTo().getId(),
                "Request completed"
            );
        }
    }
    
    public List<com.hdas.dto.RequestTimelineItem> getRequestTimeline(@NonNull UUID requestId) {
        Request request = requestRepository.findById(Objects.requireNonNull(requestId))
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
        List<Assignment> assignments = assignmentRepository.findByRequestId(Objects.requireNonNull(requestId));
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

    @Transactional
    public Assignment forwardRequest(@NonNull UUID requestId,
                                     @NonNull String targetRole,
                                     String remarks,
                                     HttpServletRequest httpRequest) {
        Request request = requestRepository.findById(Objects.requireNonNull(requestId))
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Determine current assignment (latest by assignedAt)
        List<Assignment> assignments = assignmentRepository.findByRequestId(Objects.requireNonNull(requestId));
        Assignment currentAssignment = null;
        if (!assignments.isEmpty()) {
            currentAssignment = assignments.stream()
                    .max(java.util.Comparator.comparing(Assignment::getAssignedAt))
                    .orElse(null);
        }

        // Validate workflow rule: there must be a future step in process with responsibleRole == targetRole
        List<ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(request.getProcess().getId());
        int startIndex = -1;
        if (currentAssignment != null) {
            for (int i = 0; i < steps.size(); i++) {
                var s = steps.get(i);
                var cs = currentAssignment.getProcessStep();
                boolean matches;
                if (s.getId() != null && cs.getId() != null) {
                    matches = s.getId().equals(cs.getId());
                } else {
                    matches = s == cs;
                }
                if (matches) {
                    startIndex = i;
                    break;
                }
            }
        } else {
            startIndex = -1; // from before first step
        }

        ProcessStep nextStep = null;
        for (int i = startIndex + 1; i < steps.size(); i++) {
            ProcessStep step = steps.get(i);
            if (step.getResponsibleRole() != null && step.getResponsibleRole().equalsIgnoreCase(targetRole)) {
                nextStep = step;
                break;
            }
        }
        if (nextStep == null) {
            throw new RuntimeException("Invalid workflow transition: targetRole not found in subsequent steps");
        }

        // Finalize current assignment as FORWARDED if it's in progress
        if (currentAssignment != null && "IN_PROGRESS".equals(currentAssignment.getStatus())) {
            currentAssignment.setStatus("FORWARDED");
            currentAssignment.setCompletedAt(Instant.now());
            currentAssignment = assignmentRepository.save(currentAssignment);
            auditService.logWithRequest("FORWARD_ASSIGNMENT", "Assignment", currentAssignment.getId(),
                    "IN_PROGRESS", "FORWARDED", "Assignment forwarded to role: " + targetRole, httpRequest);
        }

        // Determine who is performing the forward (current user)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User actingUser = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create new assignment for next step (this resets SLA timer)
        Assignment newAssignment = createAssignment(request, nextStep, actingUser.getId(), httpRequest);

        // Update request status and insert status history
        String previousStatus = request.getStatus();
        request.setStatus("IN_PROGRESS");
        requestRepository.save(request);

        recordStatusChange(
                request,
                previousStatus,
                "IN_PROGRESS",
                mapRoleNameToAssignedRole(nextStep.getResponsibleRole()),
                newAssignment.getAssignedTo().getId(),
                remarks != null ? remarks : ("Forwarded to role: " + targetRole)
        );

        auditService.logWithRequest("REQUEST_FORWARDED", "Request", request.getId(),
                previousStatus, request.getStatus(), "Forwarded to role: " + targetRole, httpRequest);

        return newAssignment;
    }
    public com.hdas.dto.RequestTimelineResponse getFullRequestTimeline(@NonNull UUID requestId) {
        Request request = requestRepository.findById(Objects.requireNonNull(requestId))
            .orElseThrow(() -> new RuntimeException("Request not found"));

        // Build status history items
        List<RequestStatusHistory> history = requestStatusHistoryRepository
                .findByRequestIdOrderByChangedAtAsc(Objects.requireNonNull(requestId));

        List<com.hdas.dto.StatusHistoryItem> items = new ArrayList<>();
        // Batch resolve assigned user names for timeline items
        java.util.Set<java.util.UUID> userIds = new java.util.HashSet<>();
        for (RequestStatusHistory h : history) {
            if (h.getAssignedUserId() != null) {
                userIds.add(h.getAssignedUserId());
            }
        }
        java.util.Map<java.util.UUID, String> userNameById = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            for (User u : userRepository.findAllById(userIds)) {
                userNameById.put(u.getId(), u.getUsername());
            }
        }
        java.util.Map<AssignedRole, Integer> daysByRole = new java.util.EnumMap<>(AssignedRole.class);
        for (RequestStatusHistory h : history) {
            items.add(com.hdas.dto.StatusHistoryItem.builder()
                    .timestamp(h.getChangedAt())
                    .previousStatus(h.getPreviousStatus())
                    .newStatus(h.getNewStatus())
                    .assignedRole(h.getAssignedRole())
                    .assignedUserId(h.getAssignedUserId())
                    .assignedUserName(h.getAssignedUserId() != null ? userNameById.get(h.getAssignedUserId()) : null)
                    .remarks(h.getRemarks())
                    .daysSpent(h.getDaysSpentDays() != null ? h.getDaysSpentDays() : 0)
                    .build());

            int prev = daysByRole.getOrDefault(h.getAssignedRole(), 0);
            daysByRole.put(h.getAssignedRole(), prev + (h.getDaysSpentDays() != null ? h.getDaysSpentDays() : 0));
        }

        // Build delay summaries from assignments
        List<Assignment> assignments = assignmentRepository.findByRequestId(Objects.requireNonNull(requestId));
        List<com.hdas.dto.DelaySummaryItem> delays = new ArrayList<>();
        long totalDelaySeconds = 0L;
        for (Assignment a : assignments) {
            List<Delay> assignmentDelays = delayRepository.findByAssignmentId(a.getId());
            for (Delay d : assignmentDelays) {
                totalDelaySeconds += (d.getDelaySeconds() != null ? d.getDelaySeconds() : 0L);
                int delayDays = (int) ((d.getDelaySeconds() != null ? d.getDelaySeconds() : 0L) / 86400L);
                delays.add(com.hdas.dto.DelaySummaryItem.builder()
                        .assignmentId(a.getId())
                        .reason(d.getReason())
                        .reasonCategory(d.getReasonCategory())
                        .delayDays(delayDays)
                        .detectedAt(d.getDetectedAt())
                        .justified(d.getJustified())
                        .build());
            }
        }

        int totalDaysDelayed = (int) (totalDelaySeconds / 86400L);

        return com.hdas.dto.RequestTimelineResponse.builder()
                .requestId(request.getId())
                .items(items)
                .daysByRole(daysByRole)
                .totalDaysDelayed(totalDaysDelayed)
                .delays(delays)
                .build();
    }

    // Read operations for controllers
    public java.util.List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public java.util.Optional<Request> getRequestById(@NonNull UUID id) {
        return requestRepository.findById(Objects.requireNonNull(id));
    }

    public java.util.List<Request> getRequestsByCreatorUsername(String username) {
        var user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByCreatedById(user.getId());
    }

    public java.util.List<Assignment> getAssignmentsByRequest(@NonNull UUID requestId) {
        return assignmentRepository.findByRequestId(Objects.requireNonNull(requestId));
    }

    public java.util.List<Assignment> getAssignmentsByRequestIdsOrderByAssignedAtDesc(java.util.List<UUID> requestIds) {
        if (requestIds == null || requestIds.isEmpty()) return java.util.List.of();
        return assignmentRepository.findByRequestIdInOrderByAssignedAtDesc(requestIds);
    }

    public org.springframework.data.domain.Page<Request> findRequestsByCreatorPaged(UUID userId, org.springframework.data.domain.Pageable pageable) {
        return requestRepository.findByCreatedById(Objects.requireNonNull(userId), Objects.requireNonNull(pageable));
    }

    public org.springframework.data.domain.Page<Request> findRequestsByCreatorPagedWithFilters(UUID userId,
                                                                                              String status,
                                                                                              String role,
                                                                                              org.springframework.data.domain.Pageable pageable) {
        return requestRepository.findByCreatorWithFilters(
            Objects.requireNonNull(userId),
            status,
            role,
            Objects.requireNonNull(pageable)
        );
    }

    public java.util.List<Assignment> getAssignmentsForUser(UUID userId, String status) {
        java.util.List<Assignment> all = assignmentRepository.findByAssignedToId(Objects.requireNonNull(userId));
        if (status == null || status.isBlank()) return all;
        String s = status.trim().toUpperCase();
        return all.stream().filter(a -> s.equalsIgnoreCase(a.getStatus())).toList();
    }

    public org.springframework.data.domain.Page<Assignment> getAssignmentsForUserPaged(UUID userId,
                                                                                       String status,
                                                                                       org.springframework.data.domain.Pageable pageable) {
        Objects.requireNonNull(userId);
        Objects.requireNonNull(pageable);
        if (status == null || status.isBlank()) {
            return assignmentRepository.findByAssignedToId(userId, pageable);
        }
        return assignmentRepository.findByAssignedToIdAndStatus(userId, status.trim().toUpperCase(), pageable);
    }

    public java.util.List<String> getNextRolesForRequest(@NonNull UUID requestId) {
        Request request = requestRepository.findById(Objects.requireNonNull(requestId))
            .orElseThrow(() -> new RuntimeException("Request not found"));
        java.util.List<com.hdas.domain.process.ProcessStep> steps = processStepRepository
            .findByProcessIdOrderBySequenceOrderAsc(request.getProcess().getId());
        if (steps == null || steps.isEmpty()) return java.util.List.of();

        java.util.List<Assignment> assigns = assignmentRepository.findByRequestId(request.getId());
        com.hdas.domain.process.ProcessStep currentStep = null;
        if (assigns != null && !assigns.isEmpty()) {
            assigns.sort((a,b) -> {
                java.time.Instant aa = a.getAssignedAt();
                java.time.Instant bb = b.getAssignedAt();
                if (aa == null && bb == null) return 0;
                if (aa == null) return 1;
                if (bb == null) return -1;
                return bb.compareTo(aa);
            });
            currentStep = assigns.get(0).getProcessStep();
        } else {
            currentStep = steps.get(0);
        }

        int idx = -1;
        for (int i = 0; i < steps.size(); i++) {
            if (steps.get(i).getId().equals(currentStep.getId())) { idx = i; break; }
        }
        if (idx >= 0 && idx < steps.size() - 1) {
            String nextRole = steps.get(idx + 1).getResponsibleRole();
            return nextRole != null ? java.util.List.of(nextRole) : java.util.List.of();
        }
        return java.util.List.of();
    }

    // --- Status History support ---
    private void recordStatusChange(Request request,
                                    String previousStatus,
                                    String newStatus,
                                    AssignedRole assignedRole,
                                    UUID assignedUserId,
                                    String remarks) {
        // Determine days spent since last status change or since request creation
        Instant now = Instant.now();
        Instant lastChange = requestStatusHistoryRepository
                .findTopByRequestIdOrderByChangedAtDesc(request.getId()) != null
                ? requestStatusHistoryRepository.findTopByRequestIdOrderByChangedAtDesc(request.getId()).getChangedAt()
                : request.getCreatedAt();
        long days = 0L;
        if (lastChange != null) {
            long seconds = java.time.Duration.between(lastChange, now).getSeconds();
            days = seconds / 86400;
        }

        RequestStatusHistory history = RequestStatusHistory.builder()
                .request(request)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .assignedRole(assignedRole)
                .assignedUserId(assignedUserId)
                .remarks(remarks)
                .changedAt(now)
                .daysSpentDays((int) days)
                .build();
        requestStatusHistoryRepository.save(history);
    }

    private AssignedRole mapRoleNameToAssignedRole(String roleName) {
        if (roleName == null) return AssignedRole.CLERK;
        switch (roleName.trim().toUpperCase()) {
            case "CLERK":
                return AssignedRole.CLERK;
            case "SO":
            case "SECTION OFFICER":
            case "SECTION_OFFICER":
                return AssignedRole.SO;
            case "HOD":
            case "HEAD OF DEPARTMENT":
                return AssignedRole.HOD;
            default:
                return AssignedRole.CLERK;
        }
    }
}
