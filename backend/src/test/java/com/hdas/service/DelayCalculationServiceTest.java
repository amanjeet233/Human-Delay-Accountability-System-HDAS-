package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.delay.Delay;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.sla.SLA;
import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.repository.DelayRepository;
import com.hdas.repository.SLARepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DelayCalculationServiceTest {

    private SLARepository slaRepository;
    private DelayRepository delayRepository;
    private DelayCalculationService service;

    @BeforeEach
    void setup() {
        slaRepository = mock(SLARepository.class);
        delayRepository = mock(DelayRepository.class);
        service = new DelayCalculationService(slaRepository, delayRepository);
    }

    @Test
    void calculatesDelayUsingRoleSpecificSLA() {
        // Arrange
        ProcessStep step = ProcessStep.builder()
                .responsibleRole("SECTION_OFFICER")
                .build();

        UUID roleId = UUID.randomUUID();
        Role role = Role.builder().name("SECTION_OFFICER").active(true).build();

        User assignee = User.builder()
                .username("so_user")
                .email("so@example.com")
                .passwordHash("hash")
                .firstName("SO")
                .lastName("User")
                .active(true)
                .roles(Set.of(role))
                .build();

        Assignment assignment = Assignment.builder()
                .processStep(step)
                .assignedTo(assignee)
                .startedAt(Instant.parse("2026-01-01T09:00:00Z"))
                .completedAt(Instant.parse("2026-01-01T19:00:00Z")) // 10 hours later
                .allowedDurationSeconds(8L * 3600L)
                .build();
        ArgumentCaptor<Delay> delayCaptor = ArgumentCaptor.forClass(Delay.class);
        when(delayRepository.save(delayCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        service.calculateForCompletedAssignment(assignment);

        // Assert
        Delay saved = delayCaptor.getValue();
        assertNotNull(saved, "Delay should be saved");
        assertEquals(7200L, saved.getDelaySeconds(), "Delay seconds should be 7200 (2 hours)");
        assertEquals(0, saved.getDelayDays(), "Delay days should floor-divide to 0");
        assertEquals("SECTION_OFFICER", saved.getResponsibleRole(), "Responsible role should be tagged");
                assertEquals("SLA_BREACH", saved.getReasonCategory(), "Reason category should be SLA_BREACH");
        verify(delayRepository, times(1)).save(any(Delay.class));
    }
}
