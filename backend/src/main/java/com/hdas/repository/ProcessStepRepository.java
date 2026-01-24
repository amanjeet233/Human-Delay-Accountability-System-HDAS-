package com.hdas.repository;

import com.hdas.domain.process.ProcessStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProcessStepRepository extends JpaRepository<ProcessStep, UUID> {
    List<ProcessStep> findByProcessIdOrderBySequenceOrderAsc(UUID processId);
}
