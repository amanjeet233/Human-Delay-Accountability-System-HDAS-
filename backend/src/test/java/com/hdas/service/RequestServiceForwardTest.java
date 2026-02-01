package com.hdas.service;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.process.Process;
import com.hdas.domain.process.ProcessStep;
import com.hdas.domain.request.Request;
import com.hdas.domain.request.AssignedRole;
import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RequestServiceForwardTest {

    private RequestRepository requestRepository;
    private ProcessRepository processRepository;
    private UserRepository userRepository;
    private ProcessStepRepository processStepRepository;
    private AssignmentRepository assignmentRepository;
    private SLARepository slaRepository;
    private DelayRepository delayRepository;
    private AuditService auditService;
    private FeatureFlagService featureFlagService;
    private EscalationService escalationService;
    private SLAExclusionRuleRepository slaExclusionRuleRepository;
    private RequestStatusHistoryRepository requestStatusHistoryRepository;
    private DelayCalculationService delayCalculationService;

    private RequestService requestService;

    @BeforeEach
    void setup() {
        requestRepository = mock(RequestRepository.class);
        processRepository = mock(ProcessRepository.class);
        userRepository = mock(UserRepository.class);
        processStepRepository = mock(ProcessStepRepository.class);
        assignmentRepository = mock(AssignmentRepository.class);
        slaRepository = mock(SLARepository.class);
        delayRepository = mock(DelayRepository.class);
        auditService = mock(AuditService.class);
        featureFlagService = mock(FeatureFlagService.class);
        escalationService = mock(EscalationService.class);
        slaExclusionRuleRepository = mock(SLAExclusionRuleRepository.class);
        requestStatusHistoryRepository = mock(RequestStatusHistoryRepository.class);
        delayCalculationService = mock(DelayCalculationService.class);

        requestService = new RequestService(
                requestRepository,
                processRepository,
                userRepository,
                processStepRepository,
                assignmentRepository,
                slaRepository,
                delayRepository,
                auditService,
                featureFlagService,
                escalationService,
                slaExclusionRuleRepository,
                requestStatusHistoryRepository,
                delayCalculationService
        );
    }

    @Test
    void forwardsToNextRoleUpdatesStatusAndCreatesAssignment() {
        // Arrange security context
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("admin", "pass"));

        // Entities
        Process process = Process.builder().name("P1").build();
        Request request = Request.builder()
            .process(process)
            .title("Req")
            .status("PENDING")
            .startedAt(Instant.parse("2026-01-01T00:00:00Z"))
            .createdBy(User.builder().username("admin").email("a@b.c").passwordHash("h").firstName("A").lastName("B").active(true).build())
            .build();
        ProcessStep step1 = ProcessStep.builder().process(process).name("S1").sequenceOrder(1).responsibleRole("CLERK").defaultSlaDurationSeconds(3600L).build();
        ProcessStep step2 = ProcessStep.builder().process(process).name("S2").sequenceOrder(2).responsibleRole("SECTION_OFFICER").defaultSlaDurationSeconds(7200L).build();

        Role soRole = Role.builder().name("SECTION_OFFICER").active(true).build();
        User soUser = User.builder().username("so").email("so@x.y").passwordHash("h").firstName("SO").lastName("U").active(true).roles(Set.of(soRole)).build();

        Assignment current = Assignment.builder()
                .request(request)
                .processStep(step1)
                .assignedTo(User.builder().username("clerk").email("c@x.y").passwordHash("h").firstName("C").lastName("U").active(true).build())
                .status("IN_PROGRESS")
                .assignedAt(Instant.parse("2026-01-01T01:00:00Z"))
                .startedAt(Instant.parse("2026-01-01T02:00:00Z"))
                .build();

        when(requestRepository.findById(any(UUID.class))).thenReturn(Optional.of(request));
        when(assignmentRepository.findByRequestId(any(UUID.class))).thenReturn(List.of(current));
        when(processStepRepository.findByProcessIdOrderBySequenceOrderAsc(any())).thenReturn(List.of(step1, step2));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(User.builder().username("admin").email("a@b.c").passwordHash("h").firstName("A").lastName("B").active(true).build()));
        when(userRepository.findAll()).thenReturn(List.of(soUser));
        when(featureFlagService.isFeatureEnabled(anyString())).thenReturn(false);

        // capture saves
        ArgumentCaptor<Assignment> assignmentCaptor = ArgumentCaptor.forClass(Assignment.class);
        when(assignmentRepository.save(assignmentCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));
        when(requestRepository.save(any(Request.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(requestStatusHistoryRepository.findTopByRequestIdOrderByChangedAtDesc(any())).thenReturn(null);

        HttpServletRequest httpRequest = mock(HttpServletRequest.class);

        // Act
        Assignment next = requestService.forwardRequest(UUID.randomUUID(), "SECTION_OFFICER", "Forwarded to SO", httpRequest);

        // Assert request status updated
        assertEquals("IN_PROGRESS", request.getStatus());
        // Assert two assignment saves: current forwarded and new created
        List<Assignment> saved = assignmentCaptor.getAllValues();
        assertTrue(saved.stream().anyMatch(a -> "FORWARDED".equals(a.getStatus())));
        assertTrue(saved.stream().anyMatch(a -> a.getProcessStep() == step2));
        // Assert history recorded
        verify(requestStatusHistoryRepository, times(1)).save(any());
    }

    @Test
    void invalidTargetRoleThrows() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("admin", "pass"));
        Process process = Process.builder().name("P1").build();
        Request request = Request.builder().process(process).title("Req").status("PENDING").createdBy(User.builder().username("admin").email("a@b.c").passwordHash("h").firstName("A").lastName("B").active(true).build()).build();
        ProcessStep step1 = ProcessStep.builder().process(process).name("S1").sequenceOrder(1).responsibleRole("CLERK").defaultSlaDurationSeconds(3600L).build();

        Assignment current = Assignment.builder().request(request).processStep(step1).assignedTo(User.builder().username("clerk").email("c@x.y").passwordHash("h").firstName("C").lastName("U").active(true).build()).status("IN_PROGRESS").build();

        when(requestRepository.findById(any(UUID.class))).thenReturn(Optional.of(request));
        when(assignmentRepository.findByRequestId(any(UUID.class))).thenReturn(List.of(current));
        when(processStepRepository.findByProcessIdOrderBySequenceOrderAsc(any())).thenReturn(List.of(step1));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(User.builder().username("admin").email("a@b.c").passwordHash("h").firstName("A").lastName("B").active(true).build()));

        HttpServletRequest httpRequest = mock(HttpServletRequest.class);
        assertThrows(RuntimeException.class, () -> requestService.forwardRequest(UUID.randomUUID(), "SECTION_OFFICER", "Forward", httpRequest));
    }
}
