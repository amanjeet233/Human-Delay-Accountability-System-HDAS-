package com.hdas.dto.profile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class SelfProfileUpdateRequest {
    // Full name to be split into first/last internally
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private String department;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
