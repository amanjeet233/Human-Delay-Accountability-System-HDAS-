package com.hdas.domain.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_username", columnList = "username", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    
    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String username;
    
    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 255)
    private String email;
    
    @NotBlank
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @NotBlank
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @NotBlank
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(length = 100)
    private String department;
    
    @NotNull
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
}
