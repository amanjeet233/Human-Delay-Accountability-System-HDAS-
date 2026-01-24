package com.hdas.controller;

import com.hdas.dto.CreateSLAExclusionRuleRequest;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.GovernanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/governance")
@RequiredArgsConstructor
public class GovernanceController {
    
    private final GovernanceService governanceService;
    private final FeatureFlagService featureFlagService;
    private final AuditService auditService;
    
    @PostMapping("/exclusion-rules")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> createExclusionRule(
            @Valid @RequestBody CreateSLAExclusionRuleRequest request,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            auditService.logFeatureAccessDenied("governanceAnalysis", "POST /api/governance/exclusion-rules", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(governanceService.createExclusionRule(request, httpRequest));
    }
    
    @GetMapping("/exclusion-rules")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> getExclusionRules(
            @RequestParam(required = false) UUID processStepId,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            auditService.logFeatureAccessDenied("governanceAnalysis", "GET /api/governance/exclusion-rules", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(governanceService.getExclusionRules(processStepId));
    }
    
    @GetMapping("/bottlenecks/{processId}")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, Object>> identifyBottlenecks(@PathVariable UUID processId, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            auditService.logFeatureAccessDenied("governanceAnalysis", "GET /api/governance/bottlenecks/{processId}", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(governanceService.identifyBottlenecks(processId));
    }
    
    @PostMapping("/simulate/{processId}")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Map<String, Object>> simulateDelayImpact(
            @PathVariable UUID processId,
            @RequestParam long additionalDelaySeconds,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            auditService.logFeatureAccessDenied("governanceAnalysis", "POST /api/governance/simulate/{processId}", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(governanceService.simulateDelayImpact(processId, additionalDelaySeconds));
    }
}
