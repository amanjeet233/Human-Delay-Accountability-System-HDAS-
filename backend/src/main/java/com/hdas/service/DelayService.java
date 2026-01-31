package com.hdas.service;

import com.hdas.domain.delay.Delay;
import com.hdas.dto.JustifyDelayRequest;
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
public class DelayService {
    
    private final DelayRepository delayRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    
    @Transactional
    public Delay justifyDelay(@NonNull UUID delayId, JustifyDelayRequest request, HttpServletRequest httpRequest) {
        Delay delay = delayRepository.findById(Objects.requireNonNull(delayId))
            .orElseThrow(() -> new RuntimeException("Delay not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        var user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        delay.setJustified(true);
        delay.setJustifiedById(user.getId());
        delay.setJustifiedAt(Instant.now());
        delay.setJustification(request.getJustification());
        
        delay = delayRepository.save(Objects.requireNonNull(delay));
        
        auditService.logWithRequest("JUSTIFY_DELAY", "Delay", delayId,
            "justified=false", "justified=true", "Delay justified: " + request.getJustification(), httpRequest);
        
        return delay;
    }

    // Read operations for controllers
    public java.util.List<Delay> getAllDelays() {
        return delayRepository.findAll();
    }

    public java.util.List<Delay> getDelaysByAssignment(@NonNull UUID assignmentId) {
        return delayRepository.findByAssignmentId(Objects.requireNonNull(assignmentId));
    }
}
