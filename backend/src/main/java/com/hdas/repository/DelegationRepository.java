package com.hdas.repository;

import com.hdas.domain.accountability.Delegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DelegationRepository extends JpaRepository<Delegation, UUID> {
    List<Delegation> findByAssignmentId(UUID assignmentId);
    List<Delegation> findByOriginalUserId(UUID userId);
    List<Delegation> findByDelegatedToId(UUID userId);
    List<Delegation> findByActiveTrue();
}
