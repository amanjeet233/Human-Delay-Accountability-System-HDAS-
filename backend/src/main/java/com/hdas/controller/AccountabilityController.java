package com.hdas.controller;

import com.hdas.domain.accountability.DelayDebtScore;
import com.hdas.dto.CreateDelegationRequest;
import com.hdas.service.AccountabilityService;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/accountability")
@RequiredArgsConstructor
public class AccountabilityController {
    
    private final AccountabilityService accountabilityService;
    private final FeatureFlagService featureFlagService;
    private final AuditService auditService;
    
    @PostMapping("/delegations")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> createDelegation(
            @Valid @RequestBody CreateDelegationRequest request,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            auditService.logFeatureAccessDenied("advancedAccountability", "POST /api/accountability/delegations", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(accountabilityService.createDelegation(request, httpRequest));
    }
    
    @GetMapping("/delegations/assignment/{assignmentId}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> getDelegationsByAssignment(@PathVariable @NonNull UUID assignmentId, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            auditService.logFeatureAccessDenied("advancedAccountability", "GET /api/accountability/delegations/assignment/{assignmentId}", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(accountabilityService.getDelegationsByAssignment(Objects.requireNonNull(assignmentId)));
    }
    
    @GetMapping("/delay-debt/{userId}")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> getDelayDebtScore(
            @PathVariable @NonNull UUID userId,
            @RequestParam(required = false) UUID roleId,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            auditService.logFeatureAccessDenied("advancedAccountability", "GET /api/accountability/delay-debt/{userId}", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        DelayDebtScore score = accountabilityService.getDelayDebtScore(Objects.requireNonNull(userId), roleId);
        return score != null ? ResponseEntity.ok(score) : ResponseEntity.notFound().build();
    }
    
    @PostMapping("/delay-debt/{userId}/calculate")
    @PreAuthorize("hasRole('HOD')")
    public ResponseEntity<?> calculateDelayDebt(
            @PathVariable @NonNull UUID userId,
            @RequestParam(required = false) UUID roleId,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            auditService.logFeatureAccessDenied("advancedAccountability", "POST /api/accountability/delay-debt/{userId}/calculate", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        accountabilityService.calculateDelayDebt(Objects.requireNonNull(userId), roleId);
        return ResponseEntity.ok().build();
    }
}
