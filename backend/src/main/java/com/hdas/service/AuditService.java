package com.hdas.service;

import com.hdas.model.AuditLog;
import com.hdas.repository.AuditLogRepository;
import com.hdas.security.RoleBasedAccessControl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuditService {
    
    private final AuditLogRepository auditLogRepository;
    
    public AuditLog createAuditLog(@NonNull AuditLog auditLog) {
        AuditLog saved = auditLogRepository.save(Objects.requireNonNull(auditLog));
        log.info("Created audit log: {} by {}", saved.getAction(), saved.getUsername());
        return saved;
    }
    
    public Page<AuditLog> getAllAuditLogs(@NonNull Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
    
    public Page<AuditLog> getAuditLogsByUser(String username, @NonNull Pageable pageable) {
        return auditLogRepository.findByUsername(username, pageable);
    }
    
    public Page<AuditLog> getAuditLogsByCategory(String category, @NonNull Pageable pageable) {
        return auditLogRepository.findByCategory(category, pageable);
    }
    
    public Page<AuditLog> getAuditLogsBySeverity(String severity, @NonNull Pageable pageable) {
        return auditLogRepository.findBySeverity(severity, pageable);
    }
    
    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, @NonNull Pageable pageable) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate, pageable);
    }
    
    public Page<AuditLog> getAuditLogsByLegalHold(Boolean legalHold, @NonNull Pageable pageable) {
        return auditLogRepository.findByLegalHold(legalHold, pageable);
    }
    
    public List<AuditLog> getAuditLogsByEntity(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    public AuditLog placeLegalHold(@NonNull Long auditLogId, String reason, String placedBy) {
        return auditLogRepository.findById(Objects.requireNonNull(auditLogId))
                .map(auditLog -> {
                    auditLog.setLegalHold(true);
                    auditLog.setLegalHoldReason(reason);
                    auditLog.setLegalHoldBy(placedBy);
                    auditLog.setLegalHoldAt(LocalDateTime.now());
                    
                    AuditLog saved = auditLogRepository.save(Objects.requireNonNull(auditLog));
                    log.info("Placed legal hold on audit log {} by {}", auditLogId, placedBy);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + auditLogId));
    }
    
    public AuditLog releaseLegalHold(@NonNull Long auditLogId, String releasedBy) {
        return auditLogRepository.findById(Objects.requireNonNull(auditLogId))
                .map(auditLog -> {
                    auditLog.setLegalHold(false);
                    auditLog.setLegalHoldReason(null);
                    auditLog.setLegalHoldBy(null);
                    auditLog.setLegalHoldAt(null);
                    
                    AuditLog saved = auditLogRepository.save(Objects.requireNonNull(auditLog));
                    log.info("Released legal hold on audit log {} by {}", auditLogId, releasedBy);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + auditLogId));
    }
    
    public List<AuditLog> getAuditLogsWithLegalHold() {
        return auditLogRepository.findByLegalHold(true);
    }
    
    public long getAuditLogCount() {
        return auditLogRepository.count();
    }
    
    public long getAuditLogCountBySeverity(String severity) {
        return auditLogRepository.countBySeverity(severity);
    }
    
    public long getAuditLogCountByCategory(String category) {
        return auditLogRepository.countByCategory(category);
    }
    
    public long getLegalHoldCount() {
        return auditLogRepository.countByLegalHold(true);
    }
    
    public void logAuthenticationEvent(String username, String action, String details, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType("USER")
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity("LOW")
                .category("AUTHENTICATION")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logAuthorizationEvent(String username, String action, String entityType, String entityId, String details, String ipAddress, String userAgent, String severity) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity(severity)
                .category("AUTHORIZATION")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logDataAccessEvent(String username, String action, String entityType, String entityId, String details, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity("MEDIUM")
                .category("DATA_ACCESS")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logSystemConfigEvent(String username, String action, String entityType, String entityId, String details, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity("MEDIUM")
                .category("SYSTEM_CONFIG")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logEscalationEvent(String username, String action, String entityType, String entityId, String details, String ipAddress, String userAgent, String severity) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity(severity)
                .category("ESCALATION")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logComplianceEvent(String username, String action, String entityType, String entityId, String details, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity("LOW")
                .category("COMPLIANCE")
                .build();
        
        createAuditLog(auditLog);
    }
    
    public void logWithRequest(String action, String entityType, UUID entityId, 
                              String oldValue, String newValue, String details, 
                              HttpServletRequest request) {
        String username = "system"; // Could be extracted from security context
        String ipAddress = request != null ? request.getRemoteAddr() : null;
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId != null ? entityId.toString() : null)
                .details(details)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .severity("LOW")
                .category("GENERAL")
                .build();
        
        createAuditLog(auditLog);
    }

    public void logAction(String action, String details, HttpServletRequest request) {
        logWithRequest(action, "GENERAL", null, null, null, details, request);
    }

    public void logFeatureAccessDenied(String featureName, String endpoint, HttpServletRequest request) {
        String username = RoleBasedAccessControl.getCurrentUsername();
        String ipAddress = request != null ? request.getRemoteAddr() : null;
        String userAgent = request != null ? request.getHeader("User-Agent") : null;

        logAuthorizationEvent(
                username != null ? username : "anonymous",
                "FEATURE_COMING_SOON",
                "FEATURE_FLAG",
                featureName,
                "Attempted access to endpoint: " + endpoint,
                ipAddress,
                userAgent,
                "MEDIUM"
        );
    }
    
    public AuditLog getAuditLog(@NonNull Long id) {
        return auditLogRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + id));
    }
}
