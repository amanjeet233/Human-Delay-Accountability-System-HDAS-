package com.hdas.controller;

import com.hdas.model.AuditLog;
import com.hdas.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditController {
    
    private final AuditService auditService;
    
    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Page<AuditLog>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> auditLogs;
        
        if (username != null) {
            auditLogs = auditService.getAuditLogsByUser(username, pageable);
        } else if (category != null) {
            auditLogs = auditService.getAuditLogsByCategory(category, pageable);
        } else if (severity != null) {
            auditLogs = auditService.getAuditLogsBySeverity(severity, pageable);
        } else {
            auditLogs = auditService.getAllAuditLogs(pageable);
        }
        
        return ResponseEntity.ok(auditLogs);
    }
    
    @GetMapping("/audit-logs/date-range")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Page<AuditLog>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> auditLogs = auditService.getAuditLogsByDateRange(startDate, endDate, pageable);
        
        return ResponseEntity.ok(auditLogs);
    }
    
    @GetMapping("/audit-logs/legal-hold")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<Page<AuditLog>> getAuditLogsWithLegalHold(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean legalHold) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> auditLogs = auditService.getAuditLogsByLegalHold(
            legalHold != null ? legalHold : true, pageable);
        
        return ResponseEntity.ok(auditLogs);
    }
    
    @GetMapping("/audit-logs/entity/{entityType}/{entityId}")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        
        List<AuditLog> auditLogs = auditService.getAuditLogsByEntity(entityType, entityId);
        
        return ResponseEntity.ok(auditLogs);
    }
    
    @PostMapping("/audit-logs/{auditLogId}/legal-hold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLog> placeLegalHold(
            @PathVariable Long auditLogId,
            @RequestParam String reason,
            @RequestParam String placedBy) {
        
        AuditLog auditLog = auditService.placeLegalHold(auditLogId, reason, placedBy);
        return ResponseEntity.ok(auditLog);
    }
    
    @DeleteMapping("/audit-logs/{auditLogId}/legal-hold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLog> releaseLegalHold(
            @PathVariable Long auditLogId,
            @RequestParam String releasedBy) {
        
        AuditLog auditLog = auditService.releaseLegalHold(auditLogId, releasedBy);
        return ResponseEntity.ok(auditLog);
    }
    
    @GetMapping("/audit-logs/metrics")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<AuditMetrics> getAuditMetrics() {
        
        AuditMetrics metrics = AuditMetrics.builder()
                .totalAuditLogs(auditService.getAuditLogCount())
                .criticalAuditLogs(auditService.getAuditLogCountBySeverity("CRITICAL"))
                .highAuditLogs(auditService.getAuditLogCountBySeverity("HIGH"))
                .mediumAuditLogs(auditService.getAuditLogCountBySeverity("MEDIUM"))
                .lowAuditLogs(auditService.getAuditLogCountBySeverity("LOW"))
                .authenticationLogs(auditService.getAuditLogCountByCategory("AUTHENTICATION"))
                .authorizationLogs(auditService.getAuditLogCountByCategory("AUTHORIZATION"))
                .dataAccessLogs(auditService.getAuditLogCountByCategory("DATA_ACCESS"))
                .systemConfigLogs(auditService.getAuditLogCountByCategory("SYSTEM_CONFIG"))
                .escalationLogs(auditService.getAuditLogCountByCategory("ESCALATION"))
                .complianceLogs(auditService.getAuditLogCountByCategory("COMPLIANCE"))
                .legalHoldCount(auditService.getLegalHoldCount())
                .build();
        
        return ResponseEntity.ok(metrics);
    }
    
    @GetMapping("/audit-logs/export")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<String> exportAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        // Implementation for CSV export would go here
        // For now, return a placeholder response
        return ResponseEntity.ok("Audit log export functionality would be implemented here");
    }
    
    @PostMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog auditLog) {
        AuditLog created = auditService.createAuditLog(auditLog);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/audit-logs/{auditLogId}")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<AuditLog> getAuditLog(@PathVariable Long auditLogId) {
        return ResponseEntity.ok(auditService.getAuditLog(auditLogId));
    }
    
    @GetMapping("/audit-logs/legal-hold/list")
    @PreAuthorize("hasRole('AUDITOR')")
    public ResponseEntity<List<AuditLog>> getAuditLogsWithLegalHoldList() {
        List<AuditLog> auditLogs = auditService.getAuditLogsWithLegalHold();
        return ResponseEntity.ok(auditLogs);
    }
    
    public static class AuditMetrics {
        private Long totalAuditLogs;
        private Long criticalAuditLogs;
        private Long highAuditLogs;
        private Long mediumAuditLogs;
        private Long lowAuditLogs;
        private Long authenticationLogs;
        private Long authorizationLogs;
        private Long dataAccessLogs;
        private Long systemConfigLogs;
        private Long escalationLogs;
        private Long complianceLogs;
        private Long legalHoldCount;
        
        // Getters and setters
        public Long getTotalAuditLogs() { return totalAuditLogs; }
        public void setTotalAuditLogs(Long totalAuditLogs) { this.totalAuditLogs = totalAuditLogs; }
        public Long getCriticalAuditLogs() { return criticalAuditLogs; }
        public void setCriticalAuditLogs(Long criticalAuditLogs) { this.criticalAuditLogs = criticalAuditLogs; }
        public Long getHighAuditLogs() { return highAuditLogs; }
        public void setHighAuditLogs(Long highAuditLogs) { this.highAuditLogs = highAuditLogs; }
        public Long getMediumAuditLogs() { return mediumAuditLogs; }
        public void setMediumAuditLogs(Long mediumAuditLogs) { this.mediumAuditLogs = mediumAuditLogs; }
        public Long getLowAuditLogs() { return lowAuditLogs; }
        public void setLowAuditLogs(Long lowAuditLogs) { this.lowAuditLogs = lowAuditLogs; }
        public Long getAuthenticationLogs() { return authenticationLogs; }
        public void setAuthenticationLogs(Long authenticationLogs) { this.authenticationLogs = authenticationLogs; }
        public Long getAuthorizationLogs() { return authorizationLogs; }
        public void setAuthorizationLogs(Long authorizationLogs) { this.authorizationLogs = authorizationLogs; }
        public Long getDataAccessLogs() { return dataAccessLogs; }
        public void setDataAccessLogs(Long dataAccessLogs) { this.dataAccessLogs = dataAccessLogs; }
        public Long getSystemConfigLogs() { return systemConfigLogs; }
        public void setSystemConfigLogs(Long systemConfigLogs) { this.systemConfigLogs = systemConfigLogs; }
        public Long getEscalationLogs() { return escalationLogs; }
        public void setEscalationLogs(Long escalationLogs) { this.escalationLogs = escalationLogs; }
        public Long getComplianceLogs() { return complianceLogs; }
        public void setComplianceLogs(Long complianceLogs) { this.complianceLogs = complianceLogs; }
        public Long getLegalHoldCount() { return legalHoldCount; }
        public void setLegalHoldCount(Long legalHoldCount) { this.legalHoldCount = legalHoldCount; }
        
        public static AuditMetricsBuilder builder() {
            return new AuditMetricsBuilder();
        }
        
        public static class AuditMetricsBuilder {
            private AuditMetrics metrics = new AuditMetrics();
            
            public AuditMetricsBuilder totalAuditLogs(Long totalAuditLogs) {
                metrics.totalAuditLogs = totalAuditLogs;
                return this;
            }
            
            public AuditMetricsBuilder criticalAuditLogs(Long criticalAuditLogs) {
                metrics.criticalAuditLogs = criticalAuditLogs;
                return this;
            }
            
            public AuditMetricsBuilder highAuditLogs(Long highAuditLogs) {
                metrics.highAuditLogs = highAuditLogs;
                return this;
            }
            
            public AuditMetricsBuilder mediumAuditLogs(Long mediumAuditLogs) {
                metrics.mediumAuditLogs = mediumAuditLogs;
                return this;
            }
            
            public AuditMetricsBuilder lowAuditLogs(Long lowAuditLogs) {
                metrics.lowAuditLogs = lowAuditLogs;
                return this;
            }
            
            public AuditMetricsBuilder authenticationLogs(Long authenticationLogs) {
                metrics.authenticationLogs = authenticationLogs;
                return this;
            }
            
            public AuditMetricsBuilder authorizationLogs(Long authorizationLogs) {
                metrics.authorizationLogs = authorizationLogs;
                return this;
            }
            
            public AuditMetricsBuilder dataAccessLogs(Long dataAccessLogs) {
                metrics.dataAccessLogs = dataAccessLogs;
                return this;
            }
            
            public AuditMetricsBuilder systemConfigLogs(Long systemConfigLogs) {
                metrics.systemConfigLogs = systemConfigLogs;
                return this;
            }
            
            public AuditMetricsBuilder escalationLogs(Long escalationLogs) {
                metrics.escalationLogs = escalationLogs;
                return this;
            }
            
            public AuditMetricsBuilder complianceLogs(Long complianceLogs) {
                metrics.complianceLogs = complianceLogs;
                return this;
            }
            
            public AuditMetricsBuilder legalHoldCount(Long legalHoldCount) {
                metrics.legalHoldCount = legalHoldCount;
                return this;
            }
            
            public AuditMetrics build() {
                return metrics;
            }
        }
    }
}
