package com.hdas.service;

import com.hdas.domain.process.Process;
import com.hdas.domain.process.ProcessStep;
import com.hdas.dto.CreateProcessRequest;
import com.hdas.dto.CreateProcessStepRequest;
import com.hdas.repository.ProcessRepository;
import com.hdas.repository.ProcessStepRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProcessService {
    
    private final ProcessRepository processRepository;
    private final ProcessStepRepository processStepRepository;
    private final AuditService auditService;
    
    @Transactional
    public Process createProcess(CreateProcessRequest request, HttpServletRequest httpRequest) {
        String version = request.getVersion() != null ? request.getVersion() : "v1";
        
        if (processRepository.findByNameAndVersion(request.getName(), version).isPresent()) {
            throw new RuntimeException("Process with name and version already exists");
        }
        
        Process process = Process.builder()
            .name(request.getName())
            .version(version)
            .description(request.getDescription())
            .active(true)
            .steps(new ArrayList<>())
            .build();
        
        process = processRepository.save(process);
        
        if (request.getSteps() != null) {
            for (CreateProcessStepRequest stepRequest : request.getSteps()) {
                ProcessStep step = ProcessStep.builder()
                    .process(process)
                    .name(stepRequest.getName())
                    .description(stepRequest.getDescription())
                    .sequenceOrder(stepRequest.getSequenceOrder())
                    .responsibleRole(stepRequest.getResponsibleRole())
                    .defaultSlaDurationSeconds(stepRequest.getDefaultSlaDurationSeconds())
                    .active(true)
                    .build();
                processStepRepository.save(step);
            }
        }
        
        auditService.logWithRequest("CREATE_PROCESS", "Process", process.getId(),
            null, process.getName(), "Process created: " + process.getName(), httpRequest);
        
        return process;
    }
    
    @Transactional
    public Process updateProcess(UUID id, CreateProcessRequest request, HttpServletRequest httpRequest) {
        Process process = processRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Process not found"));
        
        String oldValue = process.getName() + "|" + process.getVersion();
        
        if (request.getDescription() != null) {
            process.setDescription(request.getDescription());
        }
        if (request.getName() != null) {
            process.setName(request.getName());
        }
        
        process = processRepository.save(process);
        
        String newValue = process.getName() + "|" + process.getVersion();
        auditService.logWithRequest("UPDATE_PROCESS", "Process", id,
            oldValue, newValue, "Process updated: " + process.getName(), httpRequest);
        
        return process;
    }
    
    @Transactional
    public ProcessStep addStep(UUID processId, CreateProcessStepRequest request, HttpServletRequest httpRequest) {
        Process process = processRepository.findById(processId)
            .orElseThrow(() -> new RuntimeException("Process not found"));
        
        ProcessStep step = ProcessStep.builder()
            .process(process)
            .name(request.getName())
            .description(request.getDescription())
            .sequenceOrder(request.getSequenceOrder())
            .responsibleRole(request.getResponsibleRole())
            .defaultSlaDurationSeconds(request.getDefaultSlaDurationSeconds())
            .active(true)
            .build();
        
        step = processStepRepository.save(step);
        
        auditService.logWithRequest("CREATE_PROCESS_STEP", "ProcessStep", step.getId(),
            null, step.getName(), "Process step created: " + step.getName(), httpRequest);
        
        return step;
    }

    // Read operations for controllers
    public java.util.List<Process> getActiveProcesses() {
        return processRepository.findByActiveTrue();
    }

    public java.util.Optional<Process> getProcessById(UUID id) {
        return processRepository.findById(id);
    }
}
