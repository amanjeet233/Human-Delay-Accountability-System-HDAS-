package com.hdas.controller;

import com.hdas.dto.CreateRequestRequest;
import com.hdas.dto.RequestResponse;
import com.hdas.dto.CitizenRequestItem;
import com.hdas.security.RequirePermission;
import com.hdas.security.RequireRole;
import com.hdas.security.RoleBasedAccessControl;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.RequestService;
import com.hdas.service.DelayCalculationService;
import com.hdas.repository.UserRepository;
import com.hdas.repository.DelayRepository;
import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.request.Request;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/citizen")
@RequiredArgsConstructor
@Slf4j
@RequireRole(RoleBasedAccessControl.SystemRole.CITIZEN)
public class CitizenController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    private final DelayCalculationService delayCalculationService;
    private final UserRepository userRepository;
    private final DelayRepository delayRepository;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(HttpServletRequest httpRequest) {
        log.info("Citizen accessing dashboard");
        
        Map<String, Object> response = Map.of(
            "message", "Citizen Dashboard",
            "permissions", List.of(
                "CREATE_REQUEST", "UPLOAD_DOCUMENTS", "VIEW_OWN_REQUESTS"
            ),
            "actions", List.of(
                "create_request", "view_own_requests", "upload_documents"
            )
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/requests")
    @RequirePermission(RoleBasedAccessControl.Permission.CREATE_REQUEST)
    public ResponseEntity<RequestResponse> createRequest(
            @RequestBody CreateRequestRequest request,
            HttpServletRequest httpRequest) {
        log.info("Citizen creating request: {}", request.getTitle());
        
        try {
            auditService.logAction(
                "REQUEST_CREATED",
                "Request created by citizen: " + request.getTitle(),
                httpRequest
            );
            var created = requestService.createRequest(
                UUID.fromString(request.getProcessId()),
                request.getTitle(),
                request.getDescription(),
                httpRequest
            );
            RequestResponse response = RequestResponse.builder()
                    .id(created.getId().toString())
                    .title(created.getTitle())
                    .description(created.getDescription())
                    .status(created.getStatus())
                    .createdBy(created.getCreatedBy().getUsername())
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create request", e);
            return ResponseEntity.badRequest().body(RequestResponse.builder()
                    .id(null)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status("FAILED")
                    .createdBy(RoleBasedAccessControl.getCurrentUsername())
                    .build());
        }
    }
    
    @GetMapping({"/requests", "/my-requests"})
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_OWN_REQUESTS)
    public ResponseEntity<List<CitizenRequestItem>> getOwnRequests() {
        log.info("Citizen viewing own requests");

        try {
            String username = RoleBasedAccessControl.getCurrentUsername();
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Request> requests = requestService.getRequestsByCreatorUsername(username);
            // Batch latest assignment resolution by request
            List<java.util.UUID> requestIds = requests.stream().map(Request::getId).toList();
            java.util.Map<java.util.UUID, Assignment> latestAssignByRequest = new java.util.HashMap<>();
            if (!requestIds.isEmpty()) {
                List<Assignment> all = requestService.getAssignmentsByRequestIdsOrderByAssignedAtDesc(requestIds);
                for (Assignment a : all) {
                    java.util.UUID rid = a.getRequest().getId();
                    if (!latestAssignByRequest.containsKey(rid)) {
                        latestAssignByRequest.put(rid, a);
                    }
                }
            }

            // Build response with SLA and delay summary
            List<CitizenRequestItem> items = new java.util.ArrayList<>();
            for (Request r : requests) {
                Assignment latest = latestAssignByRequest.get(r.getId());
                String roleName = (latest != null && latest.getProcessStep() != null)
                        ? latest.getProcessStep().getResponsibleRole() : null;

                Long allowed = latest != null ? latest.getAllowedDurationSeconds() : null;
                Long elapsed = null;
                Long overdue = null;
                String slaState = null;
                if (latest != null && latest.getStartedAt() != null) {
                    elapsed = java.time.Duration.between(latest.getStartedAt(), java.time.Instant.now()).getSeconds();
                    long od = delayCalculationService.calculateCurrentOverdueSeconds(latest, java.time.Instant.now());
                    overdue = od;
                    slaState = od > 0 ? "BREACHED" : "ON_TRACK";
                }

                // Sum delays across all assignments for this request
                int totalDaysDelayed = 0;
                if (latestAssignByRequest.containsKey(r.getId())) {
                    List<Assignment> assignsForRequest = requestService.getAssignmentsByRequest(r.getId());
                    for (Assignment a : assignsForRequest) {
                        var delays = delayRepository.findByAssignmentId(a.getId());
                        for (var d : delays) {
                            totalDaysDelayed += (d.getDelayDays() != null ? d.getDelayDays() : 0);
                        }
                    }
                }

                items.add(CitizenRequestItem.builder()
                        .id(r.getId().toString())
                        .title(r.getTitle())
                        .description(r.getDescription())
                        .status(r.getStatus())
                        .processId(r.getProcess() != null ? r.getProcess().getId().toString() : null)
                        .createdAt(r.getCreatedAt())
                        .assignedRole(roleName != null ? roleName : "-")
                        .slaAllowedSeconds(allowed)
                        .slaElapsedSeconds(elapsed)
                        .slaOverdueSeconds(overdue)
                        .slaState(slaState)
                        .totalDaysDelayed(totalDaysDelayed)
                        .build());
            }

            return ResponseEntity.ok(items);
        } catch (Exception e) {
            log.error("Failed to fetch own requests", e);
            return ResponseEntity.badRequest().body(java.util.List.of());
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("citizenNotificationSystem")) {
            auditService.logFeatureAccessDenied("citizenNotificationSystem", "GET /api/citizen/notifications", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "notifications", List.of(),
                "unreadCount", 0
        ));
    }

    @GetMapping("/requests/search")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_OWN_REQUESTS)
    public ResponseEntity<?> searchOwnRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String processId,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("citizenRequestFilters")) {
            auditService.logFeatureAccessDenied("citizenRequestFilters", "GET /api/citizen/requests/search", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/requests/{id}")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_OWN_REQUESTS)
    public ResponseEntity<?> getRequestDetail(@PathVariable String id, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("citizenRequestDetail")) {
            auditService.logFeatureAccessDenied("citizenRequestDetail", "GET /api/citizen/requests/" + id, httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "id", id,
                "status", "IN_PROGRESS",
                "currentStep", null,
                "assignee", null
        ));
    }
    
    @GetMapping("/requests/{id}/timeline")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_OWN_REQUESTS)
    public ResponseEntity<com.hdas.dto.RequestTimelineResponse> getRequestTimeline(@PathVariable String id) {
        log.info("Citizen viewing request timeline: {}", id);

        try {
            java.util.UUID requestId = java.util.UUID.fromString(id);
            var request = requestService.getRequestById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            // Ownership check: citizen can only access their own requests
            String username = RoleBasedAccessControl.getCurrentUsername();
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!request.getCreatedBy().getId().equals(user.getId())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(null);
            }

            return ResponseEntity.ok(requestService.getFullRequestTimeline(requestId));
        } catch (Exception e) {
            log.error("Failed to fetch timeline for request {}", id, e);
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @PostMapping("/requests/{id}/documents")
    @RequirePermission(RoleBasedAccessControl.Permission.UPLOAD_DOCUMENTS)
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable String id,
            @RequestParam("file") String fileData) {
        log.info("Citizen uploading document for request: {}", id);
        
        return ResponseEntity.ok(Map.of(
            "message", "Document uploaded successfully",
            "requestId", id
        ));
    }
}
