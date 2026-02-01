package com.hdas.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class DelaySummaryItem {
    private UUID assignmentId;
    private String reason;
    private String reasonCategory;
    private int delayDays;
    private Instant detectedAt;
    private Boolean justified;
}
