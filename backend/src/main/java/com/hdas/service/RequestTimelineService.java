package com.hdas.service;

import com.hdas.domain.request.AssignedRole;
import com.hdas.domain.request.RequestStatusHistory;
import com.hdas.dto.RequestTimelineResponse;
import com.hdas.dto.StatusHistoryItem;
import com.hdas.repository.RequestStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.regex.Pattern;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RequestTimelineService {

    private final RequestStatusHistoryRepository requestStatusHistoryRepository;

    public RequestTimelineResponse getTimeline(@NonNull UUID requestId) {
        List<RequestStatusHistory> history = requestStatusHistoryRepository
                .findByRequestIdOrderByChangedAtAsc(Objects.requireNonNull(requestId));

        // Map to DTO items
        List<StatusHistoryItem> items = history.stream()
                .sorted(Comparator.comparing(RequestStatusHistory::getChangedAt))
                .map(h -> StatusHistoryItem.builder()
                        .timestamp(h.getChangedAt())
                        .previousStatus(h.getPreviousStatus())
                        .newStatus(h.getNewStatus())
                        .assignedRole(h.getAssignedRole())
                        .assignedUserId(h.getAssignedUserId())
                        .remarks(h.getRemarks())
                        .daysSpent(h.getDaysSpentDays() != null ? h.getDaysSpentDays() : 0)
                        .build())
                .collect(Collectors.toList());

        // Calculate total days delayed using a simple heuristic from remarks
        int totalDaysDelayed = items.stream()
                .filter(this::isDelayRelated)
                .mapToInt(StatusHistoryItem::getDaysSpent)
                .sum();

        // Aggregate days spent by role
        Map<AssignedRole, Integer> daysByRole = new EnumMap<>(AssignedRole.class);
        for (StatusHistoryItem item : items) {
            AssignedRole role = item.getAssignedRole();
            int existing = daysByRole.getOrDefault(role, 0);
            daysByRole.put(role, existing + item.getDaysSpent());
        }

        return RequestTimelineResponse.builder()
                .requestId(requestId)
                .totalDaysDelayed(totalDaysDelayed)
                .daysByRole(daysByRole)
                .items(items)
                .build();
    }

    private static final Pattern DELAY_PATTERN = Pattern.compile("delay|sla breach|breach", Pattern.CASE_INSENSITIVE);

    private boolean isDelayRelated(StatusHistoryItem item) {
        String remarks = item.getRemarks();
        if (remarks == null) return false;
        return DELAY_PATTERN.matcher(remarks).find();
    }
}
