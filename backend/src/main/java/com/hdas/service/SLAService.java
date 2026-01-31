package com.hdas.service;

import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.sla.SLA;
import com.hdas.dto.CreateSLARequest;
import com.hdas.repository.ProcessStepRepository;
import com.hdas.repository.SLARepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SLAService {
    
    private final SLARepository slaRepository;
    private final ProcessStepRepository processStepRepository;
    private final AuditService auditService;
    
    @Transactional
    public SLA createSLA(CreateSLARequest request, HttpServletRequest httpRequest) {
        ProcessStep step = processStepRepository.findById(Objects.requireNonNull(request.getProcessStepId()))
            .orElseThrow(() -> new RuntimeException("Process step not found"));
        
        SLA sla = SLA.builder()
            .processStep(step)
            .roleId(request.getRoleId())
            .roleName(request.getRoleName())
            .allowedDurationSeconds(request.getAllowedDurationSeconds())
            .description(request.getDescription())
            .active(true)
            .build();
        
        sla = slaRepository.save(Objects.requireNonNull(sla));
        
        auditService.logWithRequest("CREATE_SLA", "SLA", sla.getId(),
            null, String.valueOf(sla.getAllowedDurationSeconds()), "SLA created for step: " + step.getName(), httpRequest);
        
        return sla;
    }
    
    @Transactional
    public SLA updateSLA(@NonNull UUID id, CreateSLARequest request, HttpServletRequest httpRequest) {
        SLA sla = slaRepository.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new RuntimeException("SLA not found"));
        
        String oldValue = String.valueOf(sla.getAllowedDurationSeconds());
        
        if (request.getAllowedDurationSeconds() != null) {
            sla.setAllowedDurationSeconds(request.getAllowedDurationSeconds());
        }
        if (request.getDescription() != null) {
            sla.setDescription(request.getDescription());
        }
        if (request.getActive() != null) {
            sla.setActive(request.getActive());
        }
        
        sla = slaRepository.save(Objects.requireNonNull(sla));
        
        String newValue = String.valueOf(sla.getAllowedDurationSeconds());
        auditService.logWithRequest("UPDATE_SLA", "SLA", id,
            oldValue, newValue, "SLA updated", httpRequest);
        
        return sla;
    }

    // Read operations for controllers
    public java.util.List<SLA> getAllSLAs() {
        return slaRepository.findAll();
    }

    public java.util.List<SLA> getSLAsByProcessStep(@NonNull UUID stepId) {
        return slaRepository.findByProcessStepId(Objects.requireNonNull(stepId));
    }
}
