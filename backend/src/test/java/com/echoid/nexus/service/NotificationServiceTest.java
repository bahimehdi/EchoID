package com.echoid.nexus.service;

import com.echoid.nexus.dto.NotificationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class NotificationServiceTest {

    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService();
    }

    @Test
    void listNotifications_returnsTwoNotificationsWithCorrectStructure() {
        List<NotificationDto> result = notificationService.listNotifications();

        assertThat(result).hasSize(2);

        NotificationDto first = result.get(0);
        assertThat(first.getType()).isEqualTo("DEADLINE_REMINDER");
        assertThat(first.getChannel()).isEqualTo("PUSH");
        assertThat(first.getMessage()).contains("48 hours");
        assertThat(first.isRead()).isFalse();
        assertThat(first.getId()).isNotNull();
        assertThat(first.getSentAt()).isNotNull();
        assertThat(first.getReadAt()).isNull();
        assertThat(first.getAssignmentId()).isNotNull();

        NotificationDto second = result.get(1);
        assertThat(second.getType()).isEqualTo("MILESTONE_NUDGE");
        assertThat(second.isRead()).isTrue();
        assertThat(second.getReadAt()).isNotNull();
    }

    @Test
    void markAsRead_doesNotThrow() {
        assertThatCode(() -> notificationService.markAsRead(UUID.randomUUID()))
                .doesNotThrowAnyException();
    }
}
