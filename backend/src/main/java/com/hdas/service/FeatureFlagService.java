package com.hdas.service;

import com.hdas.model.FeatureFlag;
import com.hdas.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FeatureFlagService {
    
    private final FeatureFlagRepository featureFlagRepository;
    
    public List<FeatureFlag> getAllFeatureFlags() {
        return featureFlagRepository.findAll();
    }
    
    public Optional<FeatureFlag> getFeatureFlag(String name) {
        return featureFlagRepository.findByName(name);
    }
    
    public boolean isFeatureEnabled(String name) {
        return getFeatureFlag(name)
                .map(FeatureFlag::isEnabled)
                .orElse(false);
    }
    
    public FeatureFlag createFeatureFlag(FeatureFlag featureFlag) {
        featureFlag.setCreatedAt(LocalDateTime.now());
        featureFlag.setUpdatedAt(LocalDateTime.now());
        
        FeatureFlag saved = featureFlagRepository.save(featureFlag);
        log.info("Created feature flag: {} = {}", saved.getName(), saved.isEnabled());
        return saved;
    }
    
    public FeatureFlag updateFeatureFlag(String name, FeatureFlag update) {
        return getFeatureFlag(name)
                .map(existing -> {
                    existing.setEnabled(update.isEnabled());
                    existing.setDescription(update.getDescription());
                    existing.setRequiredRoles(update.getRequiredRoles());
                    existing.setDependencies(update.getDependencies());
                    existing.setImpact(update.getImpact());
                    existing.setUpdatedAt(LocalDateTime.now());
                    existing.setUpdatedBy(update.getUpdatedBy());
                    
                    FeatureFlag saved = featureFlagRepository.save(existing);
                    log.info("Updated feature flag: {} = {}", saved.getName(), saved.isEnabled());
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Feature flag not found: " + name));
    }
    
    public void enableFeatureFlag(String name, String updatedBy) {
        getFeatureFlag(name)
                .map(existing -> {
                    existing.setEnabled(true);
                    existing.setUpdatedAt(LocalDateTime.now());
                    existing.setUpdatedBy(updatedBy);
                    
                    FeatureFlag saved = featureFlagRepository.save(existing);
                    log.info("Enabled feature flag: {} by {}", saved.getName(), updatedBy);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Feature flag not found: " + name));
    }
    
    public void disableFeatureFlag(String name, String updatedBy) {
        getFeatureFlag(name)
                .map(existing -> {
                    existing.setEnabled(false);
                    existing.setUpdatedAt(LocalDateTime.now());
                    existing.setUpdatedBy(updatedBy);
                    
                    FeatureFlag saved = featureFlagRepository.save(existing);
                    log.info("Disabled feature flag: {} by {}", saved.getName(), updatedBy);
                    return saved;
                })
                .orElseThrow(() -> new RuntimeException("Feature flag not found: " + name));
    }
    
    public void deleteFeatureFlag(String name) {
        getFeatureFlag(name)
                .ifPresent(existing -> {
                    featureFlagRepository.delete(existing);
                    log.info("Deleted feature flag: {}", name);
                });
    }
    
    public boolean canAccessFeature(String featureName, List<String> userRoles) {
        return getFeatureFlag(featureName)
                .map(flag -> {
                    // Check if feature is enabled
                    if (!flag.isEnabled()) {
                        return false;
                    }
                    
                    // Check if user has required role
                    return flag.getRequiredRoles().stream()
                            .anyMatch(userRoles::contains);
                })
                .orElse(false);
    }
    
    public void initializeDefaultFeatureFlags() {
        List<FeatureFlag> defaultFlags = List.of(
            FeatureFlag.builder()
                    .name("escalation")
                    .description("Automatic SLA breach monitoring and escalation to higher authorities")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD", "SECTION_OFFICER"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("HIGH")
                    .category("ESCALATION")
                    .build(),

            FeatureFlag.builder()
                    .name("advancedEscalationRules")
                    .description("Advanced escalation rule types, cooldown policies, and routing controls")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD"))
                    .dependencies(List.of("escalation", "auditCompliance"))
                    .impact("MEDIUM")
                    .category("ESCALATION")
                    .build(),

            FeatureFlag.builder()
                    .name("autoEscalationEngine")
                    .description("Automated engine that evaluates SLA breach risk and triggers escalation rules")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("escalation", "auditCompliance"))
                    .impact("HIGH")
                    .category("ESCALATION")
                    .build(),

            FeatureFlag.builder()
                    .name("slaBreachAnalytics")
                    .description("SLA breach analytics and dashboards (rates, trends, root causes)")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD", "AUDITOR"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("MEDIUM")
                    .category("GOVERNANCE")
                    .build(),

            FeatureFlag.builder()
                    .name("legalEvidenceExport")
                    .description("Legal evidence export packages (signed reports, chain-of-custody ready exports)")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "AUDITOR"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("HIGH")
                    .category("COMPLIANCE")
                    .build(),

            FeatureFlag.builder()
                    .name("interDepartmentTransfer")
                    .description("Inter-department transfer workflow for requests (handoff with audit trail)")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("HIGH")
                    .category("PROCESS")
                    .build(),

            FeatureFlag.builder()
                    .name("citizenNotificationSystem")
                    .description("Citizen notification system for request status/escalation events")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("realTimeNotifications", "auditCompliance"))
                    .impact("MEDIUM")
                    .category("NOTIFICATIONS")
                    .build(),

            FeatureFlag.builder()
                    .name("adminDashboardMetrics")
                    .description("Real admin dashboard metrics computed from persisted request/assignment timing")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("auditCompliance", "slaBreachAnalytics"))
                    .impact("MEDIUM")
                    .category("ADMIN")
                    .build(),

            FeatureFlag.builder()
                    .name("auditorAdvancedQuerying")
                    .description("Advanced audit log querying (pagination, saved filters)")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "AUDITOR"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("LOW")
                    .category("AUDIT")
                    .build(),

            FeatureFlag.builder()
                    .name("citizenRequestFilters")
                    .description("Citizen request list filters (status/date/process)")
                    .enabled(false)
                    .requiredRoles(List.of("CITIZEN"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("LOW")
                    .category("CITIZEN")
                    .build(),

            FeatureFlag.builder()
                    .name("citizenRequestDetail")
                    .description("Citizen request detail page data (read-only view, current step/assignee high-level)")
                    .enabled(false)
                    .requiredRoles(List.of("CITIZEN"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("LOW")
                    .category("CITIZEN")
                    .build(),

            FeatureFlag.builder()
                    .name("soEscalationAlerts")
                    .description("Section Officer escalation alerts page + notification badge")
                    .enabled(false)
                    .requiredRoles(List.of("SECTION_OFFICER"))
                    .dependencies(List.of("escalation", "realTimeNotifications"))
                    .impact("LOW")
                    .category("SECTION_OFFICER")
                    .build(),

            FeatureFlag.builder()
                    .name("soQueueEnhancements")
                    .description("SO review queue sorting/filtering (SLA risk, priority, verified-at, escalation reason)")
                    .enabled(false)
                    .requiredRoles(List.of("SECTION_OFFICER"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("LOW")
                    .category("SECTION_OFFICER")
                    .build(),

            FeatureFlag.builder()
                    .name("hodFinalDecisionWorkflow")
                    .description("HOD final approve/reject workflow that closes request lifecycle with mandatory notes")
                    .enabled(false)
                    .requiredRoles(List.of("HOD"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("MEDIUM")
                    .category("HOD")
                    .build(),

            FeatureFlag.builder()
                    .name("clerkDelayReasonUI")
                    .description("Clerk delay reason UI with standardized categories and optional attachments")
                    .enabled(false)
                    .requiredRoles(List.of("CLERK"))
                    .dependencies(List.of("advancedAccountability"))
                    .impact("LOW")
                    .category("CLERK")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("auditCompliance")
                    .description("Immutable audit logging and compliance monitoring with legal hold support")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "AUDITOR", "HOD"))
                    .dependencies(List.of())
                    .impact("HIGH")
                    .category("CORE")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("advancedAccountability")
                    .description("Delay reason taxonomy, shadow delay tracking, and delay debt scoring")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD", "SECTION_OFFICER"))
                    .dependencies(List.of("auditCompliance"))
                    .impact("MEDIUM")
                    .category("ACCOUNTABILITY")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("governanceAnalysis")
                    .description("System performance analysis, bottleneck identification, and what-if simulations")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN", "HOD", "AUDITOR"))
                    .dependencies(List.of("auditCompliance", "advancedAccountability"))
                    .impact("MEDIUM")
                    .category("GOVERNANCE")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("transparency")
                    .description("Public access to anonymized government performance data")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("governanceAnalysis"))
                    .impact("LOW")
                    .category("TRANSPARENCY")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("realTimeNotifications")
                    .description("Instant email and push notifications for critical events")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("escalation"))
                    .impact("MEDIUM")
                    .category("ESCALATION")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("mobileApp")
                    .description("Native mobile app for field officers and remote access")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of())
                    .impact("LOW")
                    .category("TRANSPARENCY")
                    .build(),
                    
            FeatureFlag.builder()
                    .name("aiAssistance")
                    .description("AI-powered delay prediction and recommendation system")
                    .enabled(false)
                    .requiredRoles(List.of("ADMIN"))
                    .dependencies(List.of("governanceAnalysis"))
                    .impact("HIGH")
                    .category("GOVERNANCE")
                    .build()
        );
        
        defaultFlags.forEach(flag -> {
            if (!getFeatureFlag(flag.getName()).isPresent()) {
                createFeatureFlag(flag);
            }
        });
        
        log.info("Initialized default feature flags");
    }
    
    public List<FeatureFlag> getFeatureFlagsByCategory(String category) {
        return featureFlagRepository.findByCategory(category);
    }
    
    public List<FeatureFlag> getEnabledFeatureFlags() {
        return featureFlagRepository.findByEnabled(true);
    }
    
    public List<FeatureFlag> getFeatureFlagsForRole(String role) {
        // Temporary implementation - filter enabled flags manually
        return featureFlagRepository.findByEnabled(true).stream()
            .filter(flag -> flag.getRequiredRoles() != null && flag.getRequiredRoles().contains(role))
            .collect(java.util.stream.Collectors.toList());
    }
}
