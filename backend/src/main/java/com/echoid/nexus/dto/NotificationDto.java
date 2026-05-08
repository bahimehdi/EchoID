package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Notification for the student notification feed")
public class NotificationDto {

    @Schema(description = "Notification ID")
    private UUID id;

    @Schema(description = "Notification type",
            allowableValues = {"DEADLINE_REMINDER", "MILESTONE_NUDGE", "WORKLOAD_ALERT", "SYSTEM"},
            example = "DEADLINE_REMINDER")
    private String type;

    @Schema(description = "Delivery channel", allowableValues = {"PUSH", "EMAIL"}, example = "PUSH")
    private String channel;

    @Schema(description = "Human-readable notification message",
            example = "Linear Regression Report is due in 48 hours")
    private String message;

    @Schema(description = "Whether the user has read this notification", example = "false")
    private boolean isRead;

    @Schema(description = "When the notification was sent")
    private OffsetDateTime sentAt;

    @Schema(description = "When the user read the notification (null if unread)")
    private OffsetDateTime readAt;

    @Schema(description = "Related assignment ID (nullable)")
    private UUID assignmentId;
}
