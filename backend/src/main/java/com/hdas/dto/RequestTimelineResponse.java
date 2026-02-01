package com.hdas.dto;

import com.hdas.domain.request.AssignedRole;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class RequestTimelineResponse {
    private UUID requestId;
    private int totalDaysDelayed;
    private Map<AssignedRole, Integer> daysByRole;
    private List<StatusHistoryItem> items;
    private List<DelaySummaryItem> delays;
}
