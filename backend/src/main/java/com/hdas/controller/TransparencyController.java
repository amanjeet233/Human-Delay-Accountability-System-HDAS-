package com.hdas.controller;

import com.hdas.service.FeatureFlagService;
import com.hdas.service.TransparencyService;
import com.hdas.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class TransparencyController {
    
    private final TransparencyService transparencyService;
    private final FeatureFlagService featureFlagService;
    private final AuditService auditService;
    
    @GetMapping("/statistics")
    public ResponseEntity<?> getPublicStatistics(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("transparency")) {
            auditService.logFeatureAccessDenied("transparency", "GET /api/public/statistics", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(transparencyService.getPublicStatistics());
    }
    
    @GetMapping("/process-performance")
    public ResponseEntity<?> getProcessPerformanceComparison(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("transparency")) {
            auditService.logFeatureAccessDenied("transparency", "GET /api/public/process-performance", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(transparencyService.getProcessPerformanceComparison());
    }
}
