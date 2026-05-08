package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Course summary for list views")
public class CourseDto {

    @Schema(description = "Course ID")
    private UUID id;

    @Schema(description = "Course title", example = "Introduction to Machine Learning")
    private String title;

    @Schema(description = "LMS origin", example = "MOODLE", allowableValues = {"MOODLE", "GOOGLE_CLASSROOM"})
    private String lmsSource;

    @Schema(description = "University school", example = "ENSA", allowableValues = {"ENSA", "EST", "FAC", "OTHER"})
    private String school;

    @Schema(description = "Academic semester", example = "S1", allowableValues = {"S1", "S2", "ANNUAL"})
    private String semester;

    @Schema(description = "Whether the course is currently active", example = "true")
    private boolean isActive;
}
