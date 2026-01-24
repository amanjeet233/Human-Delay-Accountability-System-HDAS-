package com.hdas.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "feature")
@Getter
@Setter
public class FeatureFlagConfig {
    private Escalation escalation = new Escalation();
    private AuditCompliance auditCompliance = new AuditCompliance();
    private AdvancedAccountability advancedAccountability = new AdvancedAccountability();
    private GovernanceAnalysis governanceAnalysis = new GovernanceAnalysis();
    private Transparency transparency = new Transparency();
    
    @Getter
    @Setter
    public static class Escalation {
        private boolean enabled = false;
    }
    
    @Getter
    @Setter
    public static class AuditCompliance {
        private boolean enabled = false;
    }
    
    @Getter
    @Setter
    public static class AdvancedAccountability {
        private boolean enabled = false;
    }
    
    @Getter
    @Setter
    public static class GovernanceAnalysis {
        private boolean enabled = false;
    }
    
    @Getter
    @Setter
    public static class Transparency {
        private boolean enabled = false;
    }
}
