package com.hdas.controller;

import com.hdas.domain.request.Request;
import com.hdas.security.RoleBasedAccessControl;
import com.hdas.service.AuditService;
import com.hdas.repository.DelayRepository;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.RequestService;
import com.hdas.repository.UserRepository;
import com.hdas.security.RequirePermission;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    private final UserRepository userRepository;
    private final DelayRepository delayRepository;
    private static final Logger log = Logger.getLogger(RequestController.class.getName());
    
    @PostMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> createRequest(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        log.info("Citizen creating request: " + request.get("title"));
        
        try {
            String requestId = UUID.randomUUID().toString();
            
            auditService.logAction(
                "REQUEST_CREATED",
                "Request created: " + request.get("title"),
                httpRequest
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Request created successfully",
                "requestId", requestId,
                "title", request.get("title"),
                "description", request.get("description"),
                "processId", request.get("processId"),
                "createdBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "REQUEST_CREATION_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasRole('HOD') or hasRole('ADMIN')")
    public ResponseEntity<?> transferRequest(
            @PathVariable String id,
            @RequestBody Map<String, Object> transfer,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("interDepartmentTransfer")) {
            auditService.logFeatureAccessDenied("interDepartmentTransfer", "POST /api/requests/" + id + "/transfer", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        auditService.logAction(
                "REQUEST_TRANSFER_ATTEMPTED",
                "Transfer requested for requestId=" + id,
                httpRequest
        );

        return ResponseEntity.ok(Map.of(
                "message", "Transfer request received",
                "requestId", id,
                "transfer", transfer
        ));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<Map<String, Object>>> getOwnRequests(HttpServletRequest httpRequest) {
        log.info("Citizen viewing own requests");
        
        try {
            String username = RoleBasedAccessControl.getCurrentUsername();
            List<Request> requests = requestService.getRequestsByCreatorUsername(username);
            // Compute assigned role per request using batch assignments (latest by assignedAt)
            List<UUID> requestIds = requests.stream().map(Request::getId).toList();
            java.util.Map<UUID, String> roleByRequest = new java.util.HashMap<>();
            if (!requestIds.isEmpty()) {
                List<com.hdas.domain.assignment.Assignment> all = requestService.getAssignmentsByRequestIdsOrderByAssignedAtDesc(requestIds);
                for (com.hdas.domain.assignment.Assignment a : all) {
                    UUID rid = a.getRequest().getId();
                    if (!roleByRequest.containsKey(rid)) {
                        String roleName = a.getProcessStep() != null ? a.getProcessStep().getResponsibleRole() : null;
                        roleByRequest.put(rid, roleName != null ? roleName : "-");
                    }
                }
            }
            List<Map<String, Object>> response = requests.stream()
                .map(request -> Map.of(
                    "id", (Object) request.getId().toString(),
                    "title", (Object) request.getTitle(),
                    "description", (Object) request.getDescription(),
                    "status", (Object) request.getStatus(),
                    "createdAt", (Object) request.getCreatedAt().toString(),
                    "processId", (Object) request.getProcess().getId().toString(),
                    "assignedRole", (Object) roleByRequest.getOrDefault(request.getId(), "-")
                ))
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of(Map.of(
                "error", "REQUEST_FETCH_FAILED",
                "message", e.getMessage()
            )));
        }
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> getOwnRequestsPaged(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "createdAt,desc") String sort,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "role", required = false) String role,
            HttpServletRequest httpRequest) {
        log.info("Citizen viewing own requests (paged): page=" + page + ", size=" + size + ", sort=" + sort + ", status=" + status + ", role=" + role);

        try {
            String username = RoleBasedAccessControl.getCurrentUsername();
            var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Normalize empty filters to null
            String statusFilter = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : null;
            String roleFilter = (role != null && !role.isBlank()) ? role.trim().toUpperCase() : null;

            // Parse sort param like "field,dir"
            String[] parts = sort.split(",");
            String field = parts.length > 0 ? parts[0] : "createdAt";
            String dir = parts.length > 1 ? parts[1] : "desc";
            org.springframework.data.domain.Sort.Direction direction = "asc".equalsIgnoreCase(dir)
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;

            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    page,
                    Math.max(1, Math.min(100, size)),
                    org.springframework.data.domain.Sort.by(direction, field)
            );

            var pageData = requestService.findRequestsByCreatorPagedWithFilters(user.getId(), statusFilter, roleFilter, pageable);
            List<Request> requests = pageData.getContent();

            // Batch assigned role resolution
            List<UUID> requestIds = requests.stream().map(Request::getId).toList();
            java.util.Map<UUID, String> roleByRequest = new java.util.HashMap<>();
            if (!requestIds.isEmpty()) {
                List<com.hdas.domain.assignment.Assignment> all = requestService.getAssignmentsByRequestIdsOrderByAssignedAtDesc(requestIds);
                for (com.hdas.domain.assignment.Assignment a : all) {
                    UUID rid = a.getRequest().getId();
                    if (!roleByRequest.containsKey(rid)) {
                        String roleName = a.getProcessStep() != null ? a.getProcessStep().getResponsibleRole() : null;
                        roleByRequest.put(rid, roleName != null ? roleName : "-");
                    }
                }
            }

            List<Map<String, Object>> items = requests.stream()
                .map(request -> Map.of(
                    "id", (Object) request.getId().toString(),
                    "title", (Object) request.getTitle(),
                    "description", (Object) request.getDescription(),
                    "status", (Object) request.getStatus(),
                    "createdAt", (Object) request.getCreatedAt().toString(),
                    "processId", (Object) request.getProcess().getId().toString(),
                    "assignedRole", (Object) roleByRequest.getOrDefault(request.getId(), "-")
                ))
                .toList();

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("items", items);
            response.put("page", pageData.getNumber());
            response.put("size", pageData.getSize());
            response.put("total", pageData.getTotalElements());
            response.put("totalPages", pageData.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "REQUEST_FETCH_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> getRequest(@PathVariable String id, HttpServletRequest httpRequest) {
        log.info("Citizen viewing request: " + id);
        
        try {
            UUID requestId = UUID.fromString(id);
            Request request = requestService.getRequestById(Objects.requireNonNull(requestId))
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            Map<String, Object> response = Map.of(
                "id", request.getId().toString(),
                "title", request.getTitle(),
                "description", request.getDescription(),
                "status", request.getStatus(),
                "createdAt", request.getCreatedAt().toString(),
                "processId", request.getProcess().getId().toString(),
                "createdBy", request.getCreatedBy().getUsername()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "REQUEST_FETCH_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> submitRequest(
            @PathVariable String id,
            @RequestBody Map<String, Object> submission,
            HttpServletRequest httpRequest) {
        log.info("Citizen submitting request: " + id);
        
        try {
            auditService.logAction(
                "REQUEST_SUBMITTED",
                "Request submitted: " + id,
                httpRequest
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Request submitted successfully",
                "requestId", id,
                "status", "SUBMITTED",
                "submittedBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "REQUEST_SUBMIT_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}/status")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> getRequestStatus(@PathVariable String id, HttpServletRequest httpRequest) {
        log.info("Citizen checking request status: " + id);
        
        try {
            UUID requestId = UUID.fromString(id);
            Request request = requestService.getRequestById(Objects.requireNonNull(requestId))
                .orElseThrow(() -> new RuntimeException("Request not found"));
            
            Map<String, Object> status = Map.of(
                "requestId", request.getId().toString(),
                "status", request.getStatus(),
                "lastUpdated", request.getUpdatedAt().toString()
            );
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "STATUS_CHECK_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllRequests() {
        log.info("Admin viewing all requests");
        
        try {
            List<Request> allRequests = requestService.getAllRequests();
            List<Map<String, Object>> response = allRequests.stream()
                .map(request -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", request.getId().toString());
                    map.put("title", request.getTitle());
                    map.put("description", request.getDescription());
                    map.put("status", request.getStatus());
                    map.put("createdBy", request.getCreatedBy().getUsername());
                    map.put("createdAt", request.getCreatedAt().toString());
                    map.put("processId", request.getProcess().getId().toString());
                    return map;
                })
                .toList();
        
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of(Map.of(
                "error", "REQUEST_FETCH_FAILED",
                "message", e.getMessage()
            )));
        }
    }
    
    @PostMapping("/assignments/{assignmentId}/complete")
    @PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD')")
    public ResponseEntity<com.hdas.domain.assignment.Assignment> completeAssignment(
            @PathVariable @NonNull UUID assignmentId, @RequestBody CompleteAssignmentDto dto, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(requestService.completeAssignment(Objects.requireNonNull(assignmentId), dto.getAction(), dto.getNotes(), httpRequest));
    }
    
    @PostMapping("/assignments/{assignmentId}/start")
    @PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD')")
    public ResponseEntity<com.hdas.domain.assignment.Assignment> startAssignment(
            @PathVariable @NonNull UUID assignmentId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(requestService.startAssignment(Objects.requireNonNull(assignmentId), httpRequest));
    }

    @GetMapping("/assignments/my")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ASSIGNED_REQUESTS)
    public ResponseEntity<Map<String, Object>> getMyAssignments(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size) {
        String username = RoleBasedAccessControl.getCurrentUsername();
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page), Math.max(1, size));
        var pageData = requestService.getAssignmentsForUserPaged(user.getId(), status, pageable);
        var items = pageData.getContent().stream().map(a -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("assignmentId", a.getId().toString());
            m.put("requestId", a.getRequest().getId().toString());
            m.put("requestTitle", a.getRequest().getTitle());
            m.put("role", a.getProcessStep() != null ? a.getProcessStep().getResponsibleRole() : null);
            m.put("status", a.getStatus());
            m.put("assignedAt", a.getAssignedAt() != null ? a.getAssignedAt().toString() : null);
            m.put("startedAt", a.getStartedAt() != null ? a.getStartedAt().toString() : null);
            m.put("allowedDurationSeconds", a.getAllowedDurationSeconds());
            return m;
        }).toList();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("content", items);
        response.put("page", pageData.getNumber());
        response.put("size", pageData.getSize());
        response.put("totalElements", pageData.getTotalElements());
        response.put("totalPages", pageData.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assignments/{assignmentId}/delays")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_DELAY_REPORTS)
    public ResponseEntity<java.util.List<Map<String, Object>>> getAssignmentDelays(@PathVariable UUID assignmentId) {
        var delays = delayRepository.findByAssignmentId(Objects.requireNonNull(assignmentId));
        var items = delays.stream().map(d -> Map.of(
                "id", (Object) d.getId().toString(),
                "delayDays", (Object) d.getDelayDays(),
                "delaySeconds", (Object) d.getDelaySeconds(),
                "reason", (Object) d.getReason(),
                "justified", (Object) d.getJustified(),
                "detectedAt", (Object) (d.getDetectedAt() != null ? d.getDetectedAt().toString() : null)
        )).toList();
        return ResponseEntity.ok(items);
    }

        @GetMapping("/{id}/timeline")
        @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ALL_DATA)
    @com.hdas.security.RequireRole({
            RoleBasedAccessControl.SystemRole.CITIZEN,
            RoleBasedAccessControl.SystemRole.ADMIN,
            RoleBasedAccessControl.SystemRole.AUDITOR
    })
    public ResponseEntity<com.hdas.dto.RequestTimelineResponse> getRequestTimeline(@PathVariable @NonNull UUID id) {
        // Ownership check: Citizens can only view their own requests
        var currentRole = RoleBasedAccessControl.getCurrentUserRole();
        if (currentRole == RoleBasedAccessControl.SystemRole.CITIZEN) {
            var username = RoleBasedAccessControl.getCurrentUsername();
            var user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            var request = requestService.getRequestById(Objects.requireNonNull(id))
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            if (!request.getCreatedBy().getId().equals(user.getId())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                        .body(null);
            }
        }

        return ResponseEntity.ok(requestService.getFullRequestTimeline(Objects.requireNonNull(id)));
    }

    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD','ADMIN')")
    @RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)
    public ResponseEntity<Map<String, Object>> forwardRequest(
            @PathVariable @NonNull UUID id,
            @RequestBody ForwardRequestDto dto,
            HttpServletRequest httpRequest) {
        try {
            var assignment = requestService.forwardRequest(Objects.requireNonNull(id), dto.getTargetRole(), dto.getRemarks(), httpRequest);
            return ResponseEntity.ok(Map.of(
                    "message", "Request forwarded",
                    "requestId", id,
                    "status", "IN_PROGRESS",
                    "nextRole", assignment.getProcessStep().getResponsibleRole(),
                    "assignedTo", assignment.getAssignedTo().getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "FORWARD_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/forward/options")
    @RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)
    public ResponseEntity<Map<String, Object>> getForwardOptions(@PathVariable @NonNull UUID id) {
        java.util.List<String> roles = requestService.getNextRolesForRequest(Objects.requireNonNull(id));
        return ResponseEntity.ok(Map.of(
                "roles", roles
        ));
    }
    
    @Data
    public static class CompleteAssignmentDto {
        private String action; // APPROVE, REJECT, FORWARD
        private String notes;
    }

    @Data
    public static class ForwardRequestDto {
        private String targetRole;
        private String remarks;
    }
}
