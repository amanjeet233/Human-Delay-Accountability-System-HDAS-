package com.hdas.domain.assignment;

import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.request.Request;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assignments", indexes = {
    @Index(name = "idx_assignment_request", columnList = "request_id"),
    @Index(name = "idx_assignment_user", columnList = "assigned_to_id"),
    @Index(name = "idx_assignment_step", columnList = "process_step_id"),
    @Index(name = "idx_assignment_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    @NotNull
    private Request request;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_step_id", nullable = false)
    @NotNull
    private ProcessStep processStep;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id", nullable = false)
    @NotNull
    private User assignedTo;
    
    @Column(name = "assigned_by_id", columnDefinition = "BINARY(16)")
    private UUID assignedById;
    
    @NotBlank
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING";
    
    @Column(nullable = false)
    @Builder.Default
    private Instant assignedAt = Instant.now();
    
    @Column
    private Instant startedAt;
    
    @Column
    private Instant completedAt;
    
    @Column(columnDefinition = "BIGINT")
    private Long allowedDurationSeconds;
    
    @Column(columnDefinition = "BIGINT")
    private Long actualDurationSeconds;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Delay> delays = new ArrayList<>();
}
