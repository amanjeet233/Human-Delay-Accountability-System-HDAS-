package com.hdas.repository;

import com.hdas.domain.delay.Delay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface DelayRepository extends JpaRepository<Delay, UUID> {
    List<Delay> findByAssignmentId(UUID assignmentId);
    List<Delay> findByResponsibleUserId(UUID userId);
    List<Delay> findByJustified(Boolean justified);
    @Query("SELECT d FROM Delay d WHERE d.detectedAt BETWEEN :startDate AND :endDate")
    List<Delay> findByDetectedAtBetween(Instant startDate, Instant endDate);
}
