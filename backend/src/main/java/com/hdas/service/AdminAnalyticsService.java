package com.hdas.service;

import com.hdas.dto.admin.AdminDelayDashboardResponse;
import com.hdas.repository.DelayRepository;
import com.hdas.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {
    private final RequestRepository requestRepository;
    private final DelayRepository delayRepository;

    public AdminDelayDashboardResponse getDelayDashboard() {
        long totalRequests = requestRepository.count();
        long delayedRequests = delayRepository.countDistinctRequestsWithDelays();

        var roleAvg = delayRepository.getAvgDelayPerRole().stream()
                .map(p -> AdminDelayDashboardResponse.RoleAvgDelayItem.builder()
                        .role(p.getRole())
                        .avgDelayDays(p.getAvgDelayDays() == null ? 0.0 : p.getAvgDelayDays())
                        .count(p.getCount() == null ? 0L : p.getCount())
                        .build())
                .collect(Collectors.toList());

        var topOfficersProj = delayRepository.getTopDelayedOfficers(PageRequest.of(0, 5));
        var topOfficers = topOfficersProj.stream()
                .map(p -> AdminDelayDashboardResponse.OfficerDelayItem.builder()
                        .userId(p.getUserId().toString())
                        .fullName(p.getFullName())
                        .totalDelayDays(p.getTotalDelayDays() == null ? 0L : p.getTotalDelayDays())
                        .delayedCount(p.getDelayedCount() == null ? 0L : p.getDelayedCount())
                        .build())
                .collect(Collectors.toList());

        var deptStats = delayRepository.getDepartmentDelayStats().stream()
                .map(p -> AdminDelayDashboardResponse.DepartmentDelayItem.builder()
                        .department(p.getDepartment())
                        .delayedCount(p.getDelayedCount() == null ? 0L : p.getDelayedCount())
                        .avgDelayDays(p.getAvgDelayDays() == null ? 0.0 : p.getAvgDelayDays())
                        .build())
                .collect(Collectors.toList());

        return AdminDelayDashboardResponse.builder()
                .totalRequests(totalRequests)
                .delayedRequests(delayedRequests)
                .avgDelayPerRole(roleAvg)
                .topDelayedOfficers(topOfficers)
                .departmentDelayStats(deptStats)
                .build();
    }
}
