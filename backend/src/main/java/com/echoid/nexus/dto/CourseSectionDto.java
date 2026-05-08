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
@Schema(description = "A section or chapter within a course")
public class CourseSectionDto {

    @Schema(description = "Section ID")
    private UUID id;

    @Schema(description = "Section title", example = "Chapter 3: Sorting Algorithms")
    private String title;

    @Schema(description = "Display order within the course", example = "3")
    private int orderIndex;
}
