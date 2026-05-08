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
@Schema(description = "Assignment summary for deadline strips and workload breakdown")
public class AssignmentDto {

    @Schema(description = "Assignment ID")
    private UUID id;

    @Schema(description = "Parent course ID")
    private UUID courseId;

    @Schema(description = "Parent course title", example = "Introduction to Machine Learning")
    private String courseTitle;

    @Schema(description = "Assignment title", example = "Linear Regression Report")
    private String title;

    @Schema(description = "Assignment description (nullable)")
    private String description;

    @Schema(description = "Deadline timestamp")
    private OffsetDateTime dueAt;

    @Schema(description = "Effective complexity score (professor override or AI score)", example = "3.2")
    private double complexity;

    @Schema(description = "Assignment type for Wd weight calculation",
            allowableValues = {"EXAM", "PROJECT", "HOMEWORK"},
            example = "PROJECT")
    private String assignmentType;
}
