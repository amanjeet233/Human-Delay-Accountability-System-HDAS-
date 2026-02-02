package com.hdas.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CitizenRequestItem {
    private String id;
    private String title;
    private String description;
    private String status;
    private String processId;
    private Instant createdAt;
    private String assignedRole;

    // SLA summary for current assignment (if any)
    private Long slaAllowedSeconds;
    private Long slaElapsedSeconds;
    private Long slaOverdueSeconds;
    private String slaState; // ON_TRACK or BREACHED

    // Aggregated delays across the lifecycle
    private Integer totalDaysDelayed;
}
