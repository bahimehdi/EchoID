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
@Schema(description = "Request for AI concept explanation")
public class ExplainRequest {

    @NotBlank
    @Schema(description = "The concept to explain", example = "Big-O notation")
    private String conceptText;

    @NotNull
    @Schema(description = "Course context for the explanation")
    private UUID courseId;

    @NotNull
    @Schema(description = "Section within the course")
    private UUID sectionId;

    @NotBlank
    @Schema(description = "Desired explanation depth",
            allowableValues = {"BEGINNER", "VISUAL", "ADVANCED"},
            example = "BEGINNER")
    private String level;
}
