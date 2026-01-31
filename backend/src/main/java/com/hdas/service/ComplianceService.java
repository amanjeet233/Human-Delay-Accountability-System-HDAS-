package com.hdas.service;

import com.hdas.domain.compliance.DelayJustification;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.user.User;
import com.hdas.dto.ApproveJustificationRequest;
import com.hdas.dto.CreateJustificationRequest;
import com.hdas.repository.DelayJustificationRepository;
import com.hdas.repository.DelayRepository;
import com.hdas.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplianceService {
    
    private final DelayJustificationRepository justificationRepository;
    private final DelayRepository delayRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @Transactional
    public DelayJustification createJustification(@NonNull UUID delayId, CreateJustificationRequest request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("auditCompliance")) {
            throw new RuntimeException("Feature disabled: auditCompliance");
        }
        Delay delay = delayRepository.findById(Objects.requireNonNull(delayId))
            .orElseThrow(() -> new RuntimeException("Delay not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        DelayJustification justification = DelayJustification.builder()
            .delay(delay)
            .justifiedBy(user)
            .justificationText(request.getJustificationText())
            .approved(false)
            .build();
        
        justification = justificationRepository.save(Objects.requireNonNull(justification));
        
        auditService.logWithRequest("CREATE_JUSTIFICATION", "DelayJustification", justification.getId(),
            null, request.getJustificationText(), "Justification created for delay: " + delayId, httpRequest);
        
        return justification;
    }
    
    @Transactional
    public DelayJustification approveJustification(@NonNull UUID id, ApproveJustificationRequest request, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("auditCompliance")) {
            throw new RuntimeException("Feature disabled: auditCompliance");
        }
        DelayJustification justification = justificationRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new RuntimeException("Justification not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User approver = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        justification.setApproved(true);
        justification.setApprovedById(approver.getId());
        justification.setApprovedAt(Instant.now());
        
        // Update the delay as justified
        justification.getDelay().setJustified(true);
        justification.getDelay().setJustifiedById(approver.getId());
        justification.getDelay().setJustifiedAt(Instant.now());
        justification.getDelay().setJustification(justification.getJustificationText());
        
        justification = justificationRepository.save(Objects.requireNonNull(justification));
        
        auditService.logWithRequest("APPROVE_JUSTIFICATION", "DelayJustification", id,
            "approved=false", "approved=true", "Justification approved", httpRequest);
        
        return justification;
    }

    // Read operations for controllers
    public java.util.List<DelayJustification> getAllJustifications() {
        return justificationRepository.findAll();
    }

    public java.util.List<DelayJustification> getJustificationsByApproved(boolean approved) {
        return justificationRepository.findByApproved(approved);
    }
}
