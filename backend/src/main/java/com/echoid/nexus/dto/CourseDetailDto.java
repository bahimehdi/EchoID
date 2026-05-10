package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full course detail including section tree")
public class CourseDetailDto {

    @Schema(description = "Course ID")
    private UUID id;

    @Schema(description = "Course title", example = "Introduction to Machine Learning")
    private String title;

    @Schema(description = "LMS origin", example = "MOODLE")
    private String lmsSource;

    @Schema(description = "University school", example = "ENSA")
    private String school;

    @Schema(description = "Academic semester", example = "S1")
    private String semester;

    @Schema(description = "Whether the course is currently active", example = "true")
    private boolean isActive;

    @Schema(description = "Ordered list of course sections/chapters")
    private List<CourseSectionDto> sections;
}
