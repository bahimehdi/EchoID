package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.NotificationDto;
import com.echoid.nexus.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Student notification feed — deadline reminders, workload alerts, and milestone nudges")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lists unread and recent notifications for the authenticated user.
     * Will be paginated and filterable by type in future sprints.
     */
    @GetMapping
    @Operation(summary = "List notifications",
            description = "Returns unread and recent notifications for the authenticated user, "
                    + "ordered by sent_at descending.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<List<NotificationDto>>> listNotifications() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.listNotifications()));
    }

    /**
     * Marks a single notification as read and updates its read_at timestamp.
     * Will verify ownership so users cannot mark other users' notifications.
     */
    @PostMapping("/{id}/read")
    @Operation(summary = "Mark notification as read",
            description = "Sets is_read=true and read_at=now(). Verifies ownership.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not your notification")
    })
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Notification marked as read"));
    }
}
