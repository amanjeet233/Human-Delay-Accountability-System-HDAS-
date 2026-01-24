package com.hdas.exception;

public class FeatureDisabledException extends RuntimeException {
    private final String featureName;

    public FeatureDisabledException(String featureName) {
        super("Feature disabled: " + featureName);
        this.featureName = featureName;
    }

    public String getFeatureName() {
        return featureName;
    }
}
