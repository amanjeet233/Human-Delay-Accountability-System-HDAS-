package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.escalation.EscalationHistory;
import com.hdas.domain.escalation.EscalationRule;
import com.hdas.domain.user.User;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EscalationService {
    
    private final EscalationRuleRepository escalationRuleRepository;
    private final EscalationHistoryRepository escalationHistoryRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ProcessStepRepository processStepRepository;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @Transactional
    public void checkAndEscalate(Assignment assignment, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("escalation") || !featureFlagService.isFeatureEnabled("autoEscalationEngine")) {
            return;
        }
        
        if (assignment.getStartedAt() == null || assignment.getAllowedDurationSeconds() == null) {
            return;
        }
        
        Duration elapsed = Duration.between(assignment.getStartedAt(), Instant.now());
        long elapsedSeconds = elapsed.getSeconds();
        long allowedSeconds = assignment.getAllowedDurationSeconds();
        
        int percentageUsed = (int) ((elapsedSeconds * 100) / allowedSeconds);
        
        List<EscalationRule> rules = escalationRuleRepository.findByProcessStepId(assignment.getProcessStep().getId());
        for (EscalationRule rule : rules) {
            if (!rule.getActive()) {
                continue;
            }
            
            if (percentageUsed >= rule.getThresholdPercentage()) {
                // Check cooldown
                List<EscalationHistory> recentEscalations = escalationHistoryRepository.findByAssignmentId(assignment.getId());
                boolean shouldEscalate = true;
                
                if (!recentEscalations.isEmpty()) {
                    EscalationHistory lastEscalation = recentEscalations.get(recentEscalations.size() - 1);
                    Duration timeSinceLastEscalation = Duration.between(lastEscalation.getEscalatedAt(), Instant.now());
                    if (timeSinceLastEscalation.getSeconds() < rule.getCooldownSeconds()) {
                        shouldEscalate = false;
                    }
                }
                
                if (shouldEscalate) {
                    escalate(assignment, rule, httpRequest);
                }
            }
        }
    }
    
    @Transactional
    public EscalationHistory escalate(Assignment assignment, EscalationRule rule, HttpServletRequest httpRequest) {
        User escalatedTo = null;
        
        if (rule.getEscalationUserId() != null) {
            escalatedTo = userRepository.findById(rule.getEscalationUserId())
                .orElse(null);
        }
        
        EscalationHistory history = EscalationHistory.builder()
            .assignment(assignment)
            .escalatedFromUserId(assignment.getAssignedTo().getId())
            .escalatedToUserId(escalatedTo != null ? escalatedTo.getId() : null)
            .escalatedToRoleId(rule.getEscalationRoleId())
            .reason("SLA threshold exceeded: " + rule.getThresholdPercentage() + "%")
            .escalatedAt(Instant.now())
            .build();
        
        history = escalationHistoryRepository.save(history);
        
        auditService.logWithRequest("ESCALATE", "EscalationHistory", history.getId(),
            null, "Escalated assignment: " + assignment.getId(), "Escalation triggered", httpRequest);
        
        return history;
    }
    
    public List<EscalationHistory> getEscalationHistory(UUID assignmentId) {
        return escalationHistoryRepository.findByAssignmentId(assignmentId);
    }

    // Read operations for controllers
    public java.util.List<EscalationRule> getActiveRules() {
        return escalationRuleRepository.findByActiveTrue();
    }
    
    @Transactional
    public EscalationRule createRule(com.hdas.dto.CreateEscalationRuleRequest request, HttpServletRequest httpRequest) {
        com.hdas.domain.process.ProcessStep step = processStepRepository.findById(request.getProcessStepId())
            .orElseThrow(() -> new RuntimeException("Process step not found"));
        
        EscalationRule rule = EscalationRule.builder()
            .processStep(step)
            .thresholdPercentage(request.getThresholdPercentage())
            .escalationRoleId(request.getEscalationRoleId())
            .escalationUserId(request.getEscalationUserId())
            .cooldownSeconds(request.getCooldownSeconds())
            .active(true)
            .build();
        
        rule = escalationRuleRepository.save(rule);
        
        auditService.logWithRequest("CREATE_ESCALATION_RULE", "EscalationRule", rule.getId(),
            null, String.valueOf(rule.getThresholdPercentage()), "Escalation rule created", httpRequest);
        
        return rule;
    }
}
