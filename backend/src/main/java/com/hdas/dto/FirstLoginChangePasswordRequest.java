package com.hdas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FirstLoginChangePasswordRequest {
    @NotBlank
    private String newPassword;
}
