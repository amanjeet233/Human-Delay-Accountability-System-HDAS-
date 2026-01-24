package com.hdas.controller;

import com.hdas.dto.CreateRequestRequest;
import com.hdas.dto.RequestResponse;
import com.hdas.security.RequirePermission;
import com.hdas.security.RequireRole;
import com.hdas.security.RoleBasedAccessControl;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.RequestService;
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
    
    @GetMapping("/requests")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_OWN_REQUESTS)
    public ResponseEntity<List<RequestResponse>> getOwnRequests() {
        log.info("Citizen viewing own requests");
        
        // Implementation would return user's requests only
        List<RequestResponse> requests = List.of();
        return ResponseEntity.ok(requests);
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
    public ResponseEntity<Map<String, Object>> getRequestTimeline(@PathVariable String id) {
        log.info("Citizen viewing request timeline: {}", id);
        
        Map<String, Object> timeline = Map.of(
            "requestId", id,
            "timeline", List.of(),
            "currentStatus", "IN_PROGRESS"
        );
        
        return ResponseEntity.ok(timeline);
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
