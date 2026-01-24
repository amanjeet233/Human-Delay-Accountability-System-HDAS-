package com.hdas.controller;

import com.hdas.dto.ApproveJustificationRequest;
import com.hdas.dto.CreateJustificationRequest;
import com.hdas.service.AuditService;
import com.hdas.service.AuditReportService;
import com.hdas.service.ComplianceService;
import com.hdas.service.FeatureFlagService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
public class ComplianceController {
    
    private final ComplianceService complianceService;
    private final AuditReportService auditReportService;
    private final FeatureFlagService featureFlagService;
    private final AuditService auditService;
    
    @PostMapping("/delays/{delayId}/justify")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> createJustification(
            @PathVariable UUID delayId,
            @Valid @RequestBody CreateJustificationRequest request,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("auditCompliance")) {
            auditService.logFeatureAccessDenied("auditCompliance", "POST /api/compliance/delays/{delayId}/justify", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(complianceService.createJustification(delayId, request, httpRequest));
    }
    
    @PostMapping("/justifications/{id}/approve")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> approveJustification(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveJustificationRequest request,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("auditCompliance")) {
            auditService.logFeatureAccessDenied("auditCompliance", "POST /api/compliance/justifications/{id}/approve", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        return ResponseEntity.ok(complianceService.approveJustification(id, request, httpRequest));
    }
    
    @GetMapping("/justifications")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> getJustifications(
            @RequestParam(required = false) Boolean approved,
            HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("auditCompliance")) {
            auditService.logFeatureAccessDenied("auditCompliance", "GET /api/compliance/justifications", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        if (approved != null) {
            return ResponseEntity.ok(complianceService.getJustificationsByApproved(approved));
        }
        return ResponseEntity.ok(complianceService.getAllJustifications());
    }
    
    @GetMapping("/audit-reports/csv")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> exportAuditCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            HttpServletRequest httpRequest) throws Exception {
        if (!featureFlagService.isFeatureEnabled("auditCompliance") || !featureFlagService.isFeatureEnabled("legalEvidenceExport")) {
            auditService.logFeatureAccessDenied("legalEvidenceExport", "GET /api/compliance/audit-reports/csv", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        Resource resource = auditReportService.generateCSVReport(startDate, endDate);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-report.csv")
            .body(resource);
    }
    
    @GetMapping("/audit-reports/pdf")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<?> exportAuditPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            HttpServletRequest httpRequest) throws Exception {
        if (!featureFlagService.isFeatureEnabled("auditCompliance") || !featureFlagService.isFeatureEnabled("legalEvidenceExport")) {
            auditService.logFeatureAccessDenied("legalEvidenceExport", "GET /api/compliance/audit-reports/pdf", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }
        Resource resource = auditReportService.generatePDFReport(startDate, endDate);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=audit-report.pdf")
            .body(resource);
    }
}
