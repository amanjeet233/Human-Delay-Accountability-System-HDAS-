package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminNotificationService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public void notifyAdmins(UUID requestId, UUID assignmentId, String details) {
        List<User> admins = userRepository.findAll().stream()
            .filter(u -> Boolean.TRUE.equals(u.getActive()))
            .filter(u -> u.getRoles().stream().anyMatch(r -> "ADMIN".equalsIgnoreCase(r.getName())))
            .toList();

        String entityId = requestId != null ? requestId.toString() : null;
        String message = details != null ? details : "Auto escalation triggered";

        for (User admin : admins) {
            auditService.logEscalationEvent(
                admin.getUsername(),
                "AUTO_ESCALATION",
                "REQUEST",
                entityId,
                message + (assignmentId != null ? (" (assignmentId=" + assignmentId + ")") : ""),
                null,
                null,
                "HIGH"
            );
        }

        log.info("Auto escalation notification sent to {} admins. requestId={}, assignmentId={}",
            admins.size(), requestId, assignmentId);
    }
}
