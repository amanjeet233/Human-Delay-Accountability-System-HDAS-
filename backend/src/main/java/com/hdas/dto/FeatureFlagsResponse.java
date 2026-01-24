package com.hdas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeatureFlagsResponse {
    private boolean escalation;
    private boolean auditCompliance;
    private boolean advancedAccountability;
    private boolean governanceAnalysis;
    private boolean transparency;
}
