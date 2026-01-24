package com.hdas.repository;

import com.hdas.domain.assignment.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {
    List<Assignment> findByRequestId(UUID requestId);
    List<Assignment> findByAssignedToId(UUID userId);
    List<Assignment> findByStatus(String status);
    List<Assignment> findByRequestIdAndProcessStepId(UUID requestId, UUID processStepId);
}
