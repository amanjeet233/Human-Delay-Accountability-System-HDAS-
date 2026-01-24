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
@RequestMapping("/api/hod")
@Slf4j
@RequireRole(RoleBasedAccessControl.SystemRole.HOD)
@RequiredArgsConstructor
public class HODController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getAssignedRequests(HttpServletRequest httpRequest) {
        log.info("HOD viewing assigned requests");
        
        List<Map<String, Object>> requests = new ArrayList<>();
        
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", "req-1");
        request1.put("title", "Land Registration");
        request1.put("description", "Application for land registration with proper documentation");
        request1.put("status", "PENDING_HOD_REVIEW");
        request1.put("assignedTo", "hod_user");
        request1.put("assignedAt", "2026-01-15T10:30:00Z");
        request1.put("slaHours", 48);
        request1.put("slaDays", 5);
        request1.put("timeSpent", 36);
        request1.put("priority", "HIGH");
        request1.put("verifiedBy", "clerk_user");
        request1.put("verifiedAt", "2026-01-16T14:20:00Z");
        request1.put("slaWarning", true);
        request1.put("slaWarningMessage", "SLA breach in 12 hours");
        request1.put("escalationReason", "COMPLEX_CASE");
        requests.add(request1);

        Map<String, Object> request2 = new HashMap<>();
        request2.put("id", "req-2");
        request2.put("title", "Certificate Request");
        request2.put("description", "Application for birth certificate");
        request2.put("status", "IN_PROGRESS");
        request2.put("assignedTo", "hod_user");
        request2.put("assignedAt", "2026-01-14T14:20:00Z");
        request2.put("slaHours", 24);
        request2.put("slaDays", 3);
        request2.put("timeSpent", 18);
        request2.put("priority", "MEDIUM");
        request2.put("verifiedBy", "clerk_user");
        request2.put("verifiedAt", "2026-01-15T09:30:00Z");
        request2.put("slaWarning", false);
        request2.put("slaWarningMessage", "On track for SLA");
        requests.add(request2);

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        log.info("HOD accessing dashboard");
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalRequests", 42);
        dashboard.put("pendingApproval", 5);
        dashboard.put("escalated", 3);
        dashboard.put("slaBreached", 2);
        dashboard.put("avgProcessingTime", "2.5 days");
        
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/approval-queue")
    public ResponseEntity<List<Map<String, Object>>> getApprovalQueue() {
        log.info("Getting approval queue for HOD");
        
        List<Map<String, Object>> queue = new ArrayList<>();
        
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", "req-3");
        request1.put("title", "Property Transfer");
        request1.put("status", "PENDING_HOD_APPROVAL");
        request1.put("requestedBy", "user123");
        request1.put("requestedAt", "2026-01-18T10:30:00Z");
        request1.put("priority", "HIGH");
        queue.add(request1);
        
        Map<String, Object> request2 = new HashMap<>();
        request2.put("id", "req-4");
        request2.put("title", "License Renewal");
        request2.put("status", "PENDING_HOD_APPROVAL");
        request2.put("requestedBy", "user456");
        request2.put("requestedAt", "2026-01-18T11:45:00Z");
        request2.put("priority", "MEDIUM");
        queue.add(request2);
        
        return ResponseEntity.ok(queue);
    }

    @PutMapping("/requests/{id}/approve")
    @RequirePermission(RoleBasedAccessControl.Permission.APPROVE_REQUEST)
    public ResponseEntity<Map<String, Object>> approveRequest(@PathVariable UUID id, @RequestBody Map<String, String> payload, HttpServletRequest httpRequest) {
        log.info("HOD approving request: {}", id);
        try {
            auditService.logAction("REQUEST_APPROVED", "HOD approved request: " + id, httpRequest);
            var updated = requestService.completeAssignment(id, "APPROVE", payload.getOrDefault("notes", ""), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Request approved",
                "requestId", id,
                "status", "APPROVED",
                "nextStep", updated.getStatus()
            ));
        } catch (Exception e) {
            log.error("Failed to approve request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "APPROVE_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/requests/{id}/reject")
    @RequirePermission(RoleBasedAccessControl.Permission.REJECT_REQUEST)
    public ResponseEntity<Map<String, Object>> rejectRequest(@PathVariable UUID id, @RequestBody Map<String, String> payload, HttpServletRequest httpRequest) {
        log.info("HOD rejecting request: {}", id);
        try {
            auditService.logAction("REQUEST_REJECTED", "HOD rejected request: " + id, httpRequest);
            var updated = requestService.completeAssignment(id, "REJECT", payload.getOrDefault("notes", ""), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Request rejected",
                "requestId", id,
                "status", "REJECTED",
                "nextStep", updated.getStatus()
            ));
        } catch (Exception e) {
            log.error("Failed to reject request", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "REJECT_FAILED",
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/requests/{id}/final-approve")
    @RequirePermission(RoleBasedAccessControl.Permission.FINAL_APPROVE)
    public ResponseEntity<?> finalApprove(@PathVariable String id, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("hodFinalDecisionWorkflow")) {
            auditService.logFeatureAccessDenied("hodFinalDecisionWorkflow", "POST /api/hod/requests/" + id + "/final-approve", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "message", "Final approve recorded",
                "requestId", id,
                "notes", request.get("notes")
        ));
    }

    @PostMapping("/requests/{id}/final-reject")
    @RequirePermission(RoleBasedAccessControl.Permission.FINAL_REJECT)
    public ResponseEntity<?> finalReject(@PathVariable String id, @RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("hodFinalDecisionWorkflow")) {
            auditService.logFeatureAccessDenied("hodFinalDecisionWorkflow", "POST /api/hod/requests/" + id + "/final-reject", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(Map.of(
                "message", "Final reject recorded",
                "requestId", id,
                "reason", request.get("reason"),
                "notes", request.get("notes")
        ));
    }

    @GetMapping("/escalations")
    public ResponseEntity<List<Map<String, Object>>> getEscalations() {
        log.info("Getting escalated requests");
        
        List<Map<String, Object>> escalations = new ArrayList<>();
        
        Map<String, Object> escalation1 = new HashMap<>();
        escalation1.put("id", "esc-1");
        escalation1.put("requestId", "req-1");
        escalation1.put("reason", "COMPLEX_CASE");
        escalation1.put("escalatedBy", "so_user");
        escalation1.put("escalatedAt", "2026-01-18T14:30:00Z");
        escalation1.put("status", "PENDING");
        escalations.add(escalation1);
        
        return ResponseEntity.ok(escalations);
    }

    @PutMapping("/escalations/{id}/resolve")
    @RequirePermission(RoleBasedAccessControl.Permission.HANDLE_ESCALATIONS)
    public ResponseEntity<Map<String, Object>> resolveEscalation(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        log.info("Resolving escalation: {}", id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Escalation resolved successfully");
        response.put("escalationId", id);
        response.put("resolvedBy", "hod_user");
        response.put("resolvedAt", java.time.Instant.now().toString());
        response.put("resolution", request.get("resolution"));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/delays")
    public ResponseEntity<Map<String, Object>> getDepartmentDelayOverview() {
        log.info("Getting department delay overview");
        
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalRequests", 50);
        overview.put("delayedRequests", 15);
        overview.put("onTimeRequests", 35);
        overview.put("avgDelay", "1.5 days");
        overview.put("slaCompliance", "70%");
        
        return ResponseEntity.ok(overview);
    }
}
