package com.hdas.controller;

import com.hdas.domain.assignment.Assignment;
import com.hdas.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class AssignmentController {
    
    private final AssignmentRepository assignmentRepository;
    
    @GetMapping("/{requestId}/assignments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Assignment>> getAssignmentsByRequest(@PathVariable UUID requestId) {
        return ResponseEntity.ok(assignmentRepository.findByRequestId(requestId));
    }
}
