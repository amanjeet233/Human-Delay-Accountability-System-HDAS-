package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JustifyDelayRequest {
    @NotBlank
    private String justification;
}
