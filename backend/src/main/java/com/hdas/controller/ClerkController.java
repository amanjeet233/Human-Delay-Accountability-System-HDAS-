package com.hdas.controller;

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
import java.util.*;

@RestController
@RequestMapping("/api/clerk")
@Slf4j
@RequireRole(RoleBasedAccessControl.SystemRole.CLERK)
@RequiredArgsConstructor
public class ClerkController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        log.info("Clerk accessing dashboard");
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("message", "Clerk Dashboard");
        dashboard.put("permissions", Arrays.asList(
            "VIEW_ASSIGNED_REQUESTS", "VERIFY_REQUEST", "FORWARD_REQUEST", "ADD_DELAY_REASON"
        ));
        dashboard.put("actions", Arrays.asList(
            "view_assigned_requests", "verify_request", "forward_request", "add_delay_reason"
        ));
        
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/requests")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ASSIGNED_REQUESTS)
    public ResponseEntity<List<Map<String, Object>>> getAssignedRequests(HttpServletRequest httpRequest) {
        log.info("Clerk viewing assigned requests");
        
        List<Map<String, Object>> requests = new ArrayList<>();
        
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", "req-1");
        request1.put("title", "Land Registration");
        request1.put("description", "Application for land registration with proper documentation");
        request1.put("status", "PENDING_VERIFICATION");
        request1.put("assignedTo", "clerk_user");
        request1.put("assignedAt", "2026-01-15T10:30:00Z");
        request1.put("slaHours", 24);
        request1.put("timeSpent", 12);
        request1.put("priority", "HIGH");
        request1.put("slaWarning", true);
        request1.put("slaWarningMessage", "SLA breach in 12 hours");
        requests.add(request1);
        
        return ResponseEntity.ok(requests);
    }
    
    @PostMapping("/{id}/delay-reason/advanced")
    @RequirePermission(RoleBasedAccessControl.Permission.ADD_DELAY_REASON)
    public ResponseEntity<?> addDelayReasonAdvanced(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("clerkDelayReasonUI")) {
            auditService.logFeatureAccessDenied("clerkDelayReasonUI", "POST /api/clerk/" + id + "/delay-reason/advanced", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Advanced delay reason captured",
                "requestId", id,
                "payload", request
        ));
    }
    
    @PutMapping("/{id}/verify")
    @RequirePermission(RoleBasedAccessControl.Permission.VERIFY_REQUEST)
    public ResponseEntity<Map<String, Object>> verifyRequest(@PathVariable UUID id, HttpServletRequest httpRequest) {
        log.info("Clerk verifying request: {}", id);
        try {
            auditService.logAction("REQUEST_VERIFIED", "Clerk verified request: " + id, httpRequest);
            var updated = requestService.completeAssignment(id, "APPROVE", "Verified by clerk", httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Request verified and forwarded",
                "requestId", id,
                "status", "VERIFIED",
                "nextStep", updated.getStatus()
            ));
        } catch (Exception e) {
            log.error("Failed to verify request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "VERIFY_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/forward")
    @RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)
    public ResponseEntity<Map<String, Object>> forwardRequest(@PathVariable UUID id, @RequestBody Map<String, String> payload, HttpServletRequest httpRequest) {
        log.info("Clerk forwarding request: {} to: {}", id, payload.get("to"));
        try {
            auditService.logAction("REQUEST_FORWARDED", "Clerk forwarded request: " + id + " to " + payload.get("to"), httpRequest);
            var updated = requestService.completeAssignment(id, "FORWARD", payload.getOrDefault("notes", ""), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Request forwarded",
                "requestId", id,
                "status", "FORWARDED",
                "nextStep", updated.getStatus()
            ));
        } catch (Exception e) {
            log.error("Failed to forward request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "FORWARD_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/{id}/delay-reason")
    @RequirePermission(RoleBasedAccessControl.Permission.ADD_DELAY_REASON)
    public ResponseEntity<Map<String, Object>> addDelayReason(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        log.info("Clerk adding delay reason for request: {}", id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Delay reason added successfully");
        response.put("requestId", id);
        response.put("addedBy", "clerk_user");
        response.put("addedAt", java.time.Instant.now().toString());
        response.put("reason", request.get("reason"));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<Map<String, Object>>> getRequestTimeline(@PathVariable String id) {
        log.info("Clerk viewing timeline for request: {}", id);
        
        List<Map<String, Object>> timeline = new ArrayList<>();
        
        Map<String, Object> event1 = new HashMap<>();
        event1.put("timestamp", "2026-01-15T10:30:00Z");
        event1.put("action", "REQUEST_CREATED");
        event1.put("user", "citizen_user");
        event1.put("description", "Request submitted by citizen");
        timeline.add(event1);
        
        Map<String, Object> event2 = new HashMap<>();
        event2.put("timestamp", "2026-01-15T11:00:00Z");
        event2.put("action", "ASSIGNED_TO_CLERK");
        event2.put("user", "system");
        event2.put("description", "Request assigned to clerk for verification");
        timeline.add(event2);
        
        return ResponseEntity.ok(timeline);
    }
}
