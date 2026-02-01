package com.hdas.repository;

import com.hdas.domain.request.RequestStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestStatusHistoryRepository extends JpaRepository<RequestStatusHistory, UUID> {
    List<RequestStatusHistory> findByRequestIdOrderByChangedAtAsc(UUID requestId);
    List<RequestStatusHistory> findByAssignedUserId(UUID userId);
    List<RequestStatusHistory> findByNewStatus(String newStatus);
    RequestStatusHistory findTopByRequestIdOrderByChangedAtDesc(UUID requestId);
}
