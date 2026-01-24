package com.hdas.service;

import com.hdas.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransparencyService {
    
    private final RequestRepository requestRepository;
    private final DelayRepository delayRepository;
    private final AssignmentRepository assignmentRepository;
    private final FeatureFlagService featureFlagService;
    
    public Map<String, Object> getPublicStatistics() {
        if (!featureFlagService.isFeatureEnabled("transparency")) {
            return new HashMap<>();
        }
        
        Map<String, Object> stats = new HashMap<>();
        
        // Anonymized statistics
        long totalRequests = requestRepository.count();
        long totalDelays = delayRepository.count();
        long totalAssignments = assignmentRepository.count();
        
        // Calculate averages (anonymized)
        double averageDelaySeconds = delayRepository.findAll().stream()
            .mapToLong(com.hdas.domain.delay.Delay::getDelaySeconds)
            .average()
            .orElse(0.0);
        
        double slaComplianceRate = assignmentRepository.findAll().stream()
            .filter(a -> a.getAllowedDurationSeconds() != null && a.getActualDurationSeconds() != null)
            .mapToDouble(a -> {
                if (a.getActualDurationSeconds() <= a.getAllowedDurationSeconds()) {
                    return 1.0;
                }
                return 0.0;
            })
            .average()
            .orElse(0.0) * 100;
        
        stats.put("totalRequests", totalRequests);
        stats.put("totalDelays", totalDelays);
        stats.put("totalAssignments", totalAssignments);
        stats.put("averageDelayHours", Math.round(averageDelaySeconds / 3600.0 * 100.0) / 100.0);
        stats.put("slaComplianceRate", Math.round(slaComplianceRate * 100.0) / 100.0);
        stats.put("lastUpdated", Instant.now());
        
        return stats;
    }
    
    public Map<String, Object> getProcessPerformanceComparison() {
        if (!featureFlagService.isFeatureEnabled("transparency")) {
            return new HashMap<>();
        }
        
        Map<String, Object> comparison = new HashMap<>();
        
        // Anonymized process performance data
        // Group by process name (anonymized)
        Map<String, Long> processDelays = new HashMap<>();
        
        requestRepository.findAll().forEach(request -> {
            String processKey = "Process_" + request.getProcess().getId().toString().substring(0, 8);
            long processDelayCount = delayRepository.findAll().stream()
                .filter(d -> d.getAssignment().getRequest().getProcess().getId().equals(request.getProcess().getId()))
                .count();
            processDelays.put(processKey, processDelayCount);
        });
        
        comparison.put("processDelays", processDelays);
        comparison.put("lastUpdated", Instant.now());
        
        return comparison;
    }
}
