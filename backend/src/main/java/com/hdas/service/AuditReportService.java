package com.hdas.service;

import com.hdas.model.AuditLog;
import com.hdas.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import com.hdas.exception.FeatureDisabledException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditReportService {
    
    private final AuditLogRepository auditLogRepository;
    private final FeatureFlagService featureFlagService;
    
    public Resource generateCSVReport(Instant startDate, Instant endDate) throws IOException {
        if (!featureFlagService.isFeatureEnabled("auditCompliance") || !featureFlagService.isFeatureEnabled("legalEvidenceExport")) {
            throw new FeatureDisabledException("legalEvidenceExport");
        }
        LocalDateTime start = LocalDateTime.ofInstant(startDate, ZoneId.systemDefault());
        LocalDateTime end = LocalDateTime.ofInstant(endDate, ZoneId.systemDefault());
        List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        // CSV Header
        writer.println("Timestamp,Username,Action,EntityType,EntityId,Details,IPAddress");
        
        // CSV Data
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        for (AuditLog log : logs) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s%n",
                log.getTimestamp() != null ? formatter.format(log.getTimestamp().atZone(ZoneId.systemDefault()).toInstant()) : "",
                log.getUsername() != null ? log.getUsername() : "",
                log.getAction(),
                log.getEntityType(),
                log.getEntityId() != null ? log.getEntityId() : "",
                log.getDetails() != null ? log.getDetails().replace(",", ";") : "",
                log.getIpAddress() != null ? log.getIpAddress() : "");
        }
        
        writer.flush();
        writer.close();
        
        return new ByteArrayResource(outputStream.toByteArray());
    }
    
    public Resource generatePDFReport(Instant startDate, Instant endDate) throws IOException {
        if (!featureFlagService.isFeatureEnabled("auditCompliance") || !featureFlagService.isFeatureEnabled("legalEvidenceExport")) {
            throw new FeatureDisabledException("legalEvidenceExport");
        }
        LocalDateTime start = LocalDateTime.ofInstant(startDate, ZoneId.systemDefault());
        LocalDateTime end = LocalDateTime.ofInstant(endDate, ZoneId.systemDefault());
        List<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end, org.springframework.data.domain.Pageable.unpaged()).getContent();
        
        // Simple PDF generation using text-based approach
        // For production, use iText7 (already in dependencies)
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream);
        
        writer.println("HDAS AUDIT REPORT");
        writer.println("Generated: " + Instant.now());
        writer.println("Period: " + startDate + " to " + endDate);
        writer.println("Total Records: " + logs.size());
        writer.println("\n---\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ISO_INSTANT;
        for (AuditLog log : logs) {
            writer.println("Timestamp: " + (log.getTimestamp() != null ? formatter.format(log.getTimestamp().atZone(ZoneId.systemDefault()).toInstant()) : "N/A"));
            writer.println("User: " + (log.getUsername() != null ? log.getUsername() : "SYSTEM"));
            writer.println("Action: " + log.getAction());
            writer.println("Entity: " + log.getEntityType() + " (" + (log.getEntityId() != null ? log.getEntityId() : "N/A") + ")");
            writer.println("Details: " + (log.getDetails() != null ? log.getDetails() : ""));
            writer.println("---");
        }
        
        writer.flush();
        writer.close();
        
        return new ByteArrayResource(outputStream.toByteArray());
    }
}
