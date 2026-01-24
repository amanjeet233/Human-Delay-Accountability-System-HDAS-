package com.hdas.repository;

import com.hdas.domain.request.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {
    List<Request> findByCreatedById(UUID userId);
    List<Request> findByStatus(String status);
    List<Request> findByProcessId(UUID processId);
    @Query("SELECT r FROM Request r WHERE r.createdAt BETWEEN :startDate AND :endDate")
    List<Request> findByCreatedAtBetween(Instant startDate, Instant endDate);
}
