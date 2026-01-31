package com.hdas.controller;

import com.hdas.domain.process.Process;
import com.hdas.domain.process.ProcessStep;
import com.hdas.dto.CreateProcessRequest;
import com.hdas.dto.CreateProcessStepRequest;
import com.hdas.service.ProcessService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/processes")
@RequiredArgsConstructor
public class ProcessController {
    
    private final ProcessService processService;
    
    @GetMapping
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<Process>> getAllProcesses() {
        return ResponseEntity.ok(processService.getActiveProcesses());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Process> getProcess(@PathVariable @NonNull UUID id) {
        return processService.getProcessById(Objects.requireNonNull(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Process> createProcess(@Valid @RequestBody CreateProcessRequest request, HttpServletRequest httpRequest) {
        Process process = processService.createProcess(request, httpRequest);
        return ResponseEntity.ok(process);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Process> updateProcess(@PathVariable @NonNull UUID id, @Valid @RequestBody CreateProcessRequest request, HttpServletRequest httpRequest) {
        Process process = processService.updateProcess(Objects.requireNonNull(id), request, httpRequest);
        return ResponseEntity.ok(process);
    }
    
    @PostMapping("/{id}/steps")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProcessStep> addStep(@PathVariable @NonNull UUID id, @Valid @RequestBody CreateProcessStepRequest request, HttpServletRequest httpRequest) {
        ProcessStep step = processService.addStep(Objects.requireNonNull(id), request, httpRequest);
        return ResponseEntity.ok(step);
    }
}
