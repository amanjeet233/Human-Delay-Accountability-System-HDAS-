package com.hdas.repository;

import com.hdas.domain.compliance.DelayJustification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DelayJustificationRepository extends JpaRepository<DelayJustification, UUID> {
    List<DelayJustification> findByDelayId(UUID delayId);
    List<DelayJustification> findByApproved(Boolean approved);
}
