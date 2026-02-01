package com.hdas.dto;

import com.hdas.domain.request.AssignedRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class StatusHistoryItem {
    private Instant timestamp;
    private String previousStatus;
    private String newStatus;
    private AssignedRole assignedRole;
    private UUID assignedUserId;
    private String assignedUserName;
    private String remarks;
    private int daysSpent;
}
