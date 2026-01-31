package com.hdas.service;

import com.hdas.domain.accountability.Delegation;
import com.hdas.domain.accountability.DelayDebtScore;
import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.user.User;
import com.hdas.dto.CreateDelegationRequest;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountabilityService {
    
    private final DelegationRepository delegationRepository;
    private final DelayDebtScoreRepository delayDebtScoreRepository;
    private final AssignmentRepository assignmentRepository;
    private final DelayRepository delayRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @Transactional
    public Delegation createDelegation(CreateDelegationRequest request, HttpServletRequest httpRequest) {
        Assignment assignment = assignmentRepository.findById(Objects.requireNonNull(request.getAssignmentId()))
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User originalUser = userRepository.findById(Objects.requireNonNull(request.getOriginalUserId()))
            .orElseThrow(() -> new RuntimeException("Original user not found"));
        
        User delegatedTo = userRepository.findById(Objects.requireNonNull(request.getDelegatedToId()))
            .orElseThrow(() -> new RuntimeException("Delegated user not found"));
        
        Delegation delegation = Delegation.builder()
            .assignment(assignment)
            .originalUser(originalUser)
            .delegatedTo(delegatedTo)
            .reason(request.getReason())
            .retainAccountability(request.getRetainAccountability() != null ? request.getRetainAccountability() : true)
            .active(true)
            .build();
        
        delegation = delegationRepository.save(Objects.requireNonNull(delegation));
        
        auditService.logWithRequest("CREATE_DELEGATION", "Delegation", delegation.getId(),
            null, "Delegated to: " + delegatedTo.getUsername(), "Delegation created", httpRequest);
        
        return delegation;
    }
    
    @Transactional
    public void calculateDelayDebt(@NonNull UUID userId, UUID roleId) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            return;
        }
        
        List<Delay> delays = delayRepository.findByResponsibleUserId(Objects.requireNonNull(userId));
        
        long totalDelaySeconds = 0;
        int count = 0;
        
        for (Delay delay : delays) {
            if (roleId == null || delay.getAssignment().getProcessStep().getResponsibleRole() != null) {
                totalDelaySeconds += delay.getDelaySeconds();
                count++;
            }
        }
        
        long averageDelaySeconds = count > 0 ? totalDelaySeconds / count : 0;
        
        DelayDebtScore score = delayDebtScoreRepository.findByUserIdAndRoleId(Objects.requireNonNull(userId), roleId)
            .orElse(DelayDebtScore.builder()
            .user(userRepository.findById(Objects.requireNonNull(userId)).orElseThrow())
            .role(roleId != null ? roleRepository.findById(Objects.requireNonNull(roleId)).orElse(null) : null)
                .build());
        
        score.setTotalDelaySeconds(totalDelaySeconds);
        score.setTotalDelaysCount(count);
        score.setAverageDelaySeconds(averageDelaySeconds);
        score.setLastCalculatedAt(Instant.now());
        
        delayDebtScoreRepository.save(Objects.requireNonNull(score));
    }
    
    @Transactional
    public Delay createShadowDelay(@NonNull Assignment assignment, long delaySeconds, String reason, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("advancedAccountability")) {
            return null;
        }
        
        Delay delay = Delay.builder()
            .assignment(assignment)
            .responsibleUser(assignment.getAssignedTo())
            .delaySeconds(delaySeconds)
            .reason(reason)
            .detectedAt(Instant.now())
            .justified(false)
            .isShadowDelay(true)
            .build();
        
        delay = delayRepository.save(Objects.requireNonNull(delay));
        
        auditService.logWithRequest("CREATE_SHADOW_DELAY", "Delay", delay.getId(),
            null, String.valueOf(delaySeconds), "Shadow delay created: " + reason, httpRequest);
        
        return delay;
    }
    
    public List<Delegation> getDelegationsByAssignment(@NonNull UUID assignmentId) {
        return delegationRepository.findByAssignmentId(Objects.requireNonNull(assignmentId));
    }
    
    public DelayDebtScore getDelayDebtScore(@NonNull UUID userId, UUID roleId) {
        return delayDebtScoreRepository.findByUserIdAndRoleId(Objects.requireNonNull(userId), roleId)
            .orElse(null);
    }
}
