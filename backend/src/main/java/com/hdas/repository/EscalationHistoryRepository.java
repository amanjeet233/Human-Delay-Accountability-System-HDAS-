package com.hdas.repository;

import com.hdas.domain.escalation.EscalationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EscalationHistoryRepository extends JpaRepository<EscalationHistory, UUID> {
    List<EscalationHistory> findByAssignmentId(UUID assignmentId);
}
