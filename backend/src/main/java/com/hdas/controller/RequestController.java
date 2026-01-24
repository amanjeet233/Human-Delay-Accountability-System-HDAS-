package com.hdas.controller;

import com.hdas.domain.request.Request;
import com.hdas.domain.user.User;
import com.hdas.security.RoleBasedAccessControl;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.RequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
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
            List<Map<String, Object>> response = requests.stream()
                .map(request -> Map.of(
                    "id", (Object) request.getId().toString(),
                    "title", (Object) request.getTitle(),
                    "description", (Object) request.getDescription(),
                    "status", (Object) request.getStatus(),
                    "createdAt", (Object) request.getCreatedAt().toString(),
                    "processId", (Object) request.getProcess().getId().toString()
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
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> getRequest(@PathVariable String id, HttpServletRequest httpRequest) {
        log.info("Citizen viewing request: " + id);
        
        try {
            UUID requestId = UUID.fromString(id);
            Request request = requestService.getRequestById(requestId)
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
            Request request = requestService.getRequestById(requestId)
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
            @PathVariable UUID assignmentId, @RequestBody CompleteAssignmentDto dto, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(requestService.completeAssignment(assignmentId, dto.getAction(), dto.getNotes(), httpRequest));
    }
    
    @PostMapping("/assignments/{assignmentId}/start")
    @PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD')")
    public ResponseEntity<com.hdas.domain.assignment.Assignment> startAssignment(
            @PathVariable UUID assignmentId,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(requestService.startAssignment(assignmentId, httpRequest));
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<com.hdas.dto.RequestTimelineItem>> getRequestTimeline(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.getRequestTimeline(id));
    }
    
    @Data
    public static class CompleteAssignmentDto {
        private String action; // APPROVE, REJECT, FORWARD
        private String notes;
    }
}
