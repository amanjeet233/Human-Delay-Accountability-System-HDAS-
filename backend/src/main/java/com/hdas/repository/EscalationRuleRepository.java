package com.hdas.repository;

import com.hdas.domain.escalation.EscalationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EscalationRuleRepository extends JpaRepository<EscalationRule, UUID> {
    List<EscalationRule> findByProcessStepId(UUID processStepId);
    List<EscalationRule> findByActiveTrue();
}
