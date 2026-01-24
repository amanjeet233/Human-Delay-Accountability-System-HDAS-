package com.hdas.controller;

import com.hdas.domain.sla.SLA;
import com.hdas.dto.CreateSLARequest;
import com.hdas.repository.SLARepository;
import com.hdas.service.AuditService;
import com.hdas.service.SLAService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/slas")
@RequiredArgsConstructor
public class SLAController {
    
    private final SLARepository slaRepository;
    private final SLAService slaService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SLA>> getAllSLAs() {
        return ResponseEntity.ok(slaRepository.findAll());
    }
    
    @GetMapping("/step/{stepId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SLA>> getSLAsByStep(@PathVariable UUID stepId) {
        return ResponseEntity.ok(slaRepository.findByProcessStepId(stepId));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SLA> createSLA(@Valid @RequestBody CreateSLARequest request, HttpServletRequest httpRequest) {
        SLA sla = slaService.createSLA(request, httpRequest);
        return ResponseEntity.ok(sla);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SLA> updateSLA(@PathVariable UUID id, @Valid @RequestBody CreateSLARequest request, HttpServletRequest httpRequest) {
        SLA sla = slaService.updateSLA(id, request, httpRequest);
        return ResponseEntity.ok(sla);
    }
}
