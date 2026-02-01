package com.hdas.repository;

import com.hdas.domain.delay.Delay;
import com.hdas.dto.admin.AdminDelayDashboardResponse;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT COUNT(DISTINCT a.request.id) FROM Delay d JOIN d.assignment a")
    long countDistinctRequestsWithDelays();

    interface RoleAvgDelayProjection {
        String getRole();
        Double getAvgDelayDays();
        Long getCount();
    }

    @Query("SELECT d.responsibleRole AS role, AVG(d.delayDays) AS avgDelayDays, COUNT(d) AS count FROM Delay d GROUP BY d.responsibleRole")
    List<RoleAvgDelayProjection> getAvgDelayPerRole();

    interface OfficerDelayProjection {
        UUID getUserId();
        String getFullName();
        Long getTotalDelayDays();
        Long getDelayedCount();
    }

    @Query("SELECT u.id AS userId, CONCAT(u.firstName, ' ', u.lastName) AS fullName, SUM(d.delayDays) AS totalDelayDays, COUNT(d) AS delayedCount " +
           "FROM Delay d JOIN d.responsibleUser u GROUP BY u.id, u.firstName, u.lastName ORDER BY SUM(d.delayDays) DESC")
    List<OfficerDelayProjection> getTopDelayedOfficers(Pageable pageable);

    interface DepartmentDelayProjection {
        String getDepartment();
        Long getDelayedCount();
        Double getAvgDelayDays();
    }

    @Query("SELECT u.department AS department, COUNT(d) AS delayedCount, AVG(d.delayDays) AS avgDelayDays " +
           "FROM Delay d JOIN d.responsibleUser u GROUP BY u.department")
    List<DepartmentDelayProjection> getDepartmentDelayStats();
}
