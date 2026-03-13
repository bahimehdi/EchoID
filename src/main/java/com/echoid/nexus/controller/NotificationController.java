package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.NotificationDto;
import com.echoid.nexus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lists unread and recent notifications for the authenticated user.
     * Will be paginated and filterable by type in future sprints.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> listNotifications() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.listNotifications()));
    }

    /**
     * Marks a single notification as read and updates its read_at timestamp.
     * Will verify ownership so users cannot mark other users' notifications.
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
