package com.hdas.controller;

import com.hdas.domain.escalation.EscalationRule;
import com.hdas.dto.CreateEscalationRuleRequest;
import com.hdas.repository.EscalationHistoryRepository;
import com.hdas.repository.EscalationRuleRepository;
import com.hdas.service.AuditService;
import com.hdas.service.EscalationService;
import com.hdas.service.FeatureFlagService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/escalations")
@RequiredArgsConstructor
public class EscalationController {
    
    private final EscalationRuleRepository escalationRuleRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final EscalationService escalationService;
    private final FeatureFlagService featureFlagService;
    private final AuditService auditService;
    
    @GetMapping("/rules")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> getAllRules(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("escalation")) {
            auditService.logFeatureAccessDenied("escalation", "GET /api/escalations/rules", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(escalationRuleRepository.findByActiveTrue());
    }
    
    @PostMapping("/rules")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> createRule(@Valid @RequestBody CreateEscalationRuleRequest request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("escalation")) {
            auditService.logFeatureAccessDenied("escalation", "POST /api/escalations/rules", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        EscalationRule rule = escalationService.createRule(request, httpRequest);
        return ResponseEntity.ok(rule);
    }
    
    @GetMapping("/history/assignment/{assignmentId}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> getHistory(@PathVariable UUID assignmentId, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("escalation")) {
            auditService.logFeatureAccessDenied("escalation", "GET /api/escalations/history/assignment/{assignmentId}", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(escalationService.getEscalationHistory(assignmentId));
    }

    @GetMapping("/rules/advanced")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> getAdvancedRules(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedEscalationRules") || !featureFlagService.isFeatureEnabled("escalation")) {
            auditService.logFeatureAccessDenied("advancedEscalationRules", "GET /api/escalations/rules/advanced", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "rules", escalationRuleRepository.findByActiveTrue(),
                "capabilities", List.of("COOLDOWN_SECONDS", "ROLE_ROUTING", "USER_ROUTING")
        ));
    }

    @PostMapping("/engine/run")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> runAutoEscalation(@RequestParam UUID assignmentId, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("autoEscalationEngine") || !featureFlagService.isFeatureEnabled("escalation")) {
            auditService.logFeatureAccessDenied("autoEscalationEngine", "POST /api/escalations/engine/run", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Auto escalation evaluation triggered",
                "assignmentId", assignmentId
        ));
    }
}
