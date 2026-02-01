package com.hdas.repository;

import com.hdas.domain.request.Request;
import com.hdas.domain.assignment.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface RequestRepository extends JpaRepository<Request, UUID> {
    List<Request> findByCreatedById(UUID userId);
    Page<Request> findByCreatedById(UUID userId, Pageable pageable);
    List<Request> findByStatus(String status);
    List<Request> findByProcessId(UUID processId);
    @Query("SELECT r FROM Request r WHERE r.createdAt BETWEEN :startDate AND :endDate")
    List<Request> findByCreatedAtBetween(Instant startDate, Instant endDate);

    @Query("""
        SELECT r FROM Request r
        LEFT JOIN Assignment a ON a.request.id = r.id
            AND a.assignedAt = (
                SELECT MAX(a2.assignedAt) FROM Assignment a2 WHERE a2.request.id = r.id
            )
        WHERE r.createdBy.id = :userId
          AND (:status IS NULL OR r.status = :status)
          AND (:role IS NULL OR a.processStep.responsibleRole = :role)
    """)
    Page<Request> findByCreatorWithFilters(
        @Param("userId") UUID userId,
        @Param("status") String status,
        @Param("role") String role,
        Pageable pageable
    );
}
