package com.hdas.repository;

import com.hdas.domain.accountability.DelayDebtScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DelayDebtScoreRepository extends JpaRepository<DelayDebtScore, UUID> {
    Optional<DelayDebtScore> findByUserIdAndRoleId(UUID userId, UUID roleId);
    List<DelayDebtScore> findByUserId(UUID userId);
}
