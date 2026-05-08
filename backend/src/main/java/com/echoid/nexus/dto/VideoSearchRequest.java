package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "YouTube video search request")
public class VideoSearchRequest {

    @NotBlank
    @Schema(description = "Concept to search videos for", example = "Big-O notation")
    private String conceptText;

    @NotNull
    @Schema(description = "Course context for relevance filtering")
    private UUID courseId;
}
