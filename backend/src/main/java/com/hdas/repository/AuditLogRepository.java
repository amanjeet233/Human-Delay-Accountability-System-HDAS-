package com.hdas.repository;

import com.hdas.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    Page<AuditLog> findByUsername(String username, Pageable pageable);
    
    Page<AuditLog> findByCategory(String category, Pageable pageable);
    
    Page<AuditLog> findBySeverity(String severity, Pageable pageable);
    
    Page<AuditLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Page<AuditLog> findByLegalHold(Boolean legalHold, Pageable pageable);
    
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
    
    List<AuditLog> findByLegalHold(Boolean legalHold);
    
    long countBySeverity(String severity);
    
    long countByCategory(String category);
    
    long countByLegalHold(Boolean legalHold);
    
    //    @Query("SELECT COUNT(*) FROM audit_logs WHERE timestamp >= :startDate AND timestamp <= :endDate")
//    long countByTimestampBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
