package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Unified event ingestion — discriminated by eventType. "
        + "Both the mobile app and AI microservice write to this endpoint.")
public class EventRequest {

    @NotBlank
    @Schema(description = "Event discriminator",
            allowableValues = {"concept_query", "professor_upload", "notification_sent", "session_event"},
            example = "concept_query")
    private String eventType;

    @Schema(description = "Student user ID (for student-originated events)")
    private UUID studentId;

    @Schema(description = "Professor user ID (for professor-originated events)")
    private UUID professorId;

    @Schema(description = "Course context")
    private UUID courseId;

    @Schema(description = "Section context within a course")
    private UUID sectionId;

    // --- concept_query fields ---
    @Schema(description = "Concept text queried by the student (concept_query only)", example = "Big-O complexity")
    private String conceptText;

    @Schema(description = "Explanation level selected (concept_query only)",
            allowableValues = {"BEGINNER", "VISUAL", "ADVANCED"})
    private String explanationLevel;

    // --- professor_upload fields ---
    @Schema(description = "File type uploaded (professor_upload only)", example = "PDF")
    private String fileType;

    // --- notification_sent fields ---
    @Schema(description = "What triggered the notification (notification_sent only)", example = "WORKLOAD_CRITICAL")
    private String triggerType;

    @Schema(description = "Summary of notification payload (notification_sent only)")
    private String payloadSummary;

    // --- session_event fields ---
    @Schema(description = "Session event type (session_event only)",
            allowableValues = {"LOGIN", "LOGOUT", "SCREEN_VIEW"})
    private String sessionEventType;

    @NotNull
    @Schema(description = "When the event occurred")
    private OffsetDateTime timestamp;
}
