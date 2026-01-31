package com.hdas.dto.admin;

import jakarta.validation.constraints.NotNull;

public class UserStatusPatchRequest {
    @NotNull
    private Boolean active;

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
