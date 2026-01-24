package com.hdas.controller;

import com.hdas.domain.delay.Delay;
import com.hdas.dto.JustifyDelayRequest;
import com.hdas.repository.DelayRepository;
import com.hdas.service.DelayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/delays")
@RequiredArgsConstructor
public class DelayController {
    
    private final DelayRepository delayRepository;
    private final DelayService delayService;
    
    @GetMapping
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<List<Delay>> getAllDelays() {
        return ResponseEntity.ok(delayRepository.findAll());
    }
    
    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<List<Delay>> getDelaysByAssignment(@PathVariable UUID assignmentId) {
        return ResponseEntity.ok(delayRepository.findByAssignmentId(assignmentId));
    }
    
    @PostMapping("/{id}/justify")
    @PreAuthorize("hasRole('CLERK')")
    public ResponseEntity<Delay> justifyDelay(@PathVariable UUID id, @Valid @RequestBody JustifyDelayRequest request, HttpServletRequest httpRequest) {
        Delay delay = delayService.justifyDelay(id, request, httpRequest);
        return ResponseEntity.ok(delay);
    }
}

