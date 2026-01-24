package com.hdas.service;

import com.hdas.domain.governance.SLAExclusionRule;
import com.hdas.domain.process.ProcessStep;
import com.hdas.dto.CreateSLAExclusionRuleRequest;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GovernanceService {
    
    private final SLAExclusionRuleRepository exclusionRuleRepository;
    private final ProcessStepRepository processStepRepository;
    private final AssignmentRepository assignmentRepository;
    private final DelayRepository delayRepository;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @Transactional
    public SLAExclusionRule createExclusionRule(CreateSLAExclusionRuleRequest request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            throw new RuntimeException("Feature disabled: governanceAnalysis");
        }
        ProcessStep step = request.getProcessStepId() != null ?
            processStepRepository.findById(request.getProcessStepId()).orElse(null) : null;
        
        SLAExclusionRule rule = SLAExclusionRule.builder()
            .processStep(step)
            .ruleType(request.getRuleType())
            .exclusionStart(request.getExclusionStart())
            .exclusionEnd(request.getExclusionEnd())
            .description(request.getDescription())
            .active(true)
            .build();
        
        rule = exclusionRuleRepository.save(rule);
        
        auditService.logWithRequest("CREATE_SLA_EXCLUSION", "SLAExclusionRule", rule.getId(),
            null, request.getRuleType(), "SLA exclusion rule created", httpRequest);
        
        return rule;
    }
    
    public Map<String, Object> identifyBottlenecks(UUID processId) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            return Collections.emptyMap();
        }
        
        List<com.hdas.domain.process.ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(processId);
        Map<String, Object> bottlenecks = new HashMap<>();
        Map<String, Long> stepDelays = new HashMap<>();
        Map<String, Integer> stepCounts = new HashMap<>();
        
        for (com.hdas.domain.process.ProcessStep step : steps) {
            List<com.hdas.domain.assignment.Assignment> assignments = assignmentRepository.findByRequestId(null)
                .stream()
                .filter(a -> a.getProcessStep().getId().equals(step.getId()))
                .toList();
            
            long totalDelay = 0;
            int delayCount = 0;
            
            for (com.hdas.domain.assignment.Assignment assignment : assignments) {
                List<com.hdas.domain.delay.Delay> delays = delayRepository.findByAssignmentId(assignment.getId());
                for (com.hdas.domain.delay.Delay delay : delays) {
                    totalDelay += delay.getDelaySeconds();
                    delayCount++;
                }
            }
            
            stepDelays.put(step.getName(), totalDelay);
            stepCounts.put(step.getName(), delayCount);
        }
        
        // Find step with highest delay
        String bottleneckStep = stepDelays.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("None");
        
        bottlenecks.put("bottleneckStep", bottleneckStep);
        bottlenecks.put("stepDelays", stepDelays);
        bottlenecks.put("stepCounts", stepCounts);
        
        return bottlenecks;
    }
    
    public Map<String, Object> simulateDelayImpact(UUID processId, long additionalDelaySeconds) {
        if (!featureFlagService.isFeatureEnabled("governanceAnalysis")) {
            return Collections.emptyMap();
        }
        
        Map<String, Object> simulation = new HashMap<>();
        
        // Rule-based simulation: calculate impact on SLA compliance
        List<com.hdas.domain.process.ProcessStep> steps = processStepRepository.findByProcessIdOrderBySequenceOrderAsc(processId);
        int totalSteps = steps.size();
        long averageSlaDuration = (long) steps.stream()
            .filter(s -> s.getDefaultSlaDurationSeconds() != null)
            .mapToLong(com.hdas.domain.process.ProcessStep::getDefaultSlaDurationSeconds)
            .average()
            .orElse(86400.0);
        
        double complianceImpact = (double) additionalDelaySeconds / (averageSlaDuration * totalSteps) * 100;
        
        simulation.put("additionalDelaySeconds", additionalDelaySeconds);
        simulation.put("estimatedComplianceImpact", Math.max(0, 100 - complianceImpact));
        simulation.put("totalProcessSteps", totalSteps);
        simulation.put("averageSlaDuration", averageSlaDuration);
        
        return simulation;
    }
    
    public List<SLAExclusionRule> getExclusionRules(UUID processStepId) {
        if (processStepId != null) {
            return exclusionRuleRepository.findByProcessStepId(processStepId);
        }
        return exclusionRuleRepository.findByActiveTrue();
    }
}
