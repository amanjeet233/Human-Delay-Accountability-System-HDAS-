package com.hdas.repository;

import com.hdas.domain.sla.SLA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SLARepository extends JpaRepository<SLA, UUID> {
    List<SLA> findByProcessStepId(UUID processStepId);
    Optional<SLA> findByProcessStepIdAndRoleId(UUID processStepId, UUID roleId);
    List<SLA> findByActiveTrue();
}
