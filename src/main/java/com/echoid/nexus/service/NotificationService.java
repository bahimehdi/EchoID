package com.echoid.nexus.service;

import com.echoid.nexus.dto.NotificationDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    public List<NotificationDto> listNotifications() {
        return List.of(
                NotificationDto.builder()
                        .id(UUID.randomUUID())
                        .type("DEADLINE_REMINDER")
                        .message("Linear Regression Report is due in 48 hours")
                        .isRead(false)
                        .build(),
                NotificationDto.builder()
                        .id(UUID.randomUUID())
                        .type("MILESTONE_NUDGE")
                        .message("You have 2 milestones pending for Neural Network Lab")
                        .isRead(true)
                        .build()
        );
    }

    public void markAsRead(UUID id) {
        // Stub: will find notification by ID, verify ownership, set is_read=true and read_at=now()
    }
}
