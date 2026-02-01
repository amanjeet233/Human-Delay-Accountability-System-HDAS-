package com.hdas.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDelayDashboardResponse {
    private long totalRequests;
    private long delayedRequests;
    private List<RoleAvgDelayItem> avgDelayPerRole;
    private List<OfficerDelayItem> topDelayedOfficers;
    private List<DepartmentDelayItem> departmentDelayStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleAvgDelayItem {
        private String role;
        private double avgDelayDays;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OfficerDelayItem {
        private String userId;
        private String fullName;
        private long totalDelayDays;
        private long delayedCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentDelayItem {
        private String department;
        private long delayedCount;
        private double avgDelayDays;
    }
}
