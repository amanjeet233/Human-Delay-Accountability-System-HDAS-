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
@RequestMapping("/api/so")
@Slf4j
@RequireRole(RoleBasedAccessControl.SystemRole.SECTION_OFFICER)
@RequiredArgsConstructor
public class SectionOfficerController {
    
    private final RequestService requestService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>> getAssignedRequests(HttpServletRequest httpRequest) {
        log.info("Section Officer viewing assigned requests");
        
        List<Map<String, Object>> requests = new ArrayList<>();
        
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", "req-1");
        request1.put("title", "Land Registration");
        request1.put("description", "Application for land registration with proper documentation");
        request1.put("status", "PENDING_SO_REVIEW");
        request1.put("assignedTo", "so_user");
        request1.put("assignedAt", "2026-01-15T10:30:00Z");
        request1.put("slaHours", 48);
        request1.put("slaDays", 5);
        request1.put("timeSpent", 36);
        request1.put("priority", "HIGH");
        request1.put("verifiedBy", "clerk_user");
        request1.put("verifiedAt", "2026-01-16T14:20:00Z");
        request1.put("slaWarning", true);
        request1.put("slaWarningMessage", "SLA breach in 12 hours");
        requests.add(request1);

        Map<String, Object> request2 = new HashMap<>();
        request2.put("id", "req-2");
        request2.put("title", "Certificate Request");
        request2.put("description", "Application for birth certificate");
        request2.put("status", "IN_PROGRESS");
        request2.put("assignedTo", "so_user");
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
        log.info("Section Officer accessing dashboard");
        
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalRequests", 35);
        dashboard.put("pendingReview", 8);
        dashboard.put("escalated", 2);
        dashboard.put("slaBreached", 1);
        dashboard.put("avgProcessingTime", "1.8 days");
        
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/review-queue")
    public ResponseEntity<List<Map<String, Object>>> getReviewQueue() {
        log.info("Getting review queue for Section Officer");
        
        List<Map<String, Object>> queue = new ArrayList<>();
        
        Map<String, Object> request1 = new HashMap<>();
        request1.put("id", "req-5");
        request1.put("title", "Property Transfer");
        request1.put("status", "PENDING_SO_REVIEW");
        request1.put("verifiedBy", "clerk_user");
        request1.put("verifiedAt", "2026-01-18T10:30:00Z");
        request1.put("priority", "HIGH");
        queue.add(request1);
        
        return ResponseEntity.ok(queue);
    }

    @GetMapping("/review-queue/enhanced")
    public ResponseEntity<?> getEnhancedReviewQueue(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("soQueueEnhancements")) {
            auditService.logFeatureAccessDenied("soQueueEnhancements", "GET /api/so/review-queue/enhanced", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return getReviewQueue();
    }

    @PutMapping("/requests/{id}/approve")
    @RequirePermission(RoleBasedAccessControl.Permission.APPROVE_REQUEST)
    public ResponseEntity<Map<String, Object>> approveRequest(@PathVariable UUID id, @RequestBody Map<String, String> payload, HttpServletRequest httpRequest) {
        log.info("Section Officer approving request: {}", id);
        try {
            auditService.logAction("REQUEST_APPROVED", "SO approved request: " + id, httpRequest);
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
        log.info("Section Officer rejecting request: {}", id);
        try {
            auditService.logAction("REQUEST_REJECTED", "SO rejected request: " + id, httpRequest);
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
    
    @PutMapping("/requests/{id}/forward")
    @RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)
    public ResponseEntity<Map<String, Object>> forwardRequest(@PathVariable UUID id, @RequestBody Map<String, String> payload, HttpServletRequest httpRequest) {
        log.info("Section Officer forwarding request: {} to: {}", id, payload.get("to"));
        try {
            auditService.logAction("REQUEST_FORWARDED", "SO forwarded request: " + id + " to " + payload.get("to"), httpRequest);
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

    @GetMapping("/escalations")
    public ResponseEntity<List<Map<String, Object>>> getEscalationAlerts() {
        log.info("Getting escalation alerts");
        
        List<Map<String, Object>> escalations = new ArrayList<>();
        
        Map<String, Object> escalation1 = new HashMap<>();
        escalation1.put("id", "esc-2");
        escalation1.put("requestId", "req-1");
        escalation1.put("reason", "DOCUMENT_VERIFICATION_REQUIRED");
        escalation1.put("escalatedBy", "hod_user");
        escalation1.put("escalatedAt", "2026-01-18T16:30:00Z");
        escalation1.put("status", "PENDING");
        escalations.add(escalation1);
        
        return ResponseEntity.ok(escalations);
    }

    @GetMapping("/escalations/alerts")
    public ResponseEntity<?> getEscalationAlertsComingSoon(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("soEscalationAlerts")) {
            auditService.logFeatureAccessDenied("soEscalationAlerts", "GET /api/so/escalations/alerts", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return getEscalationAlerts();
    }
}
