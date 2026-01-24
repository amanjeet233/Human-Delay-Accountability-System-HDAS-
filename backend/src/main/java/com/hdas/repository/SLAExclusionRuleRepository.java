package com.hdas.repository;

import com.hdas.domain.governance.SLAExclusionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SLAExclusionRuleRepository extends JpaRepository<SLAExclusionRule, UUID> {
    List<SLAExclusionRule> findByProcessStepId(UUID processStepId);
    List<SLAExclusionRule> findByRuleType(String ruleType);
    List<SLAExclusionRule> findByActiveTrue();
    
    @Query("SELECT r FROM SLAExclusionRule r WHERE r.active = true AND " +
           "r.exclusionStart <= :instant AND r.exclusionEnd >= :instant")
    List<SLAExclusionRule> findActiveRulesForInstant(Instant instant);
}
