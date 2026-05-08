package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "AI-generated explanation card displayed to the student")
public class ExplanationCardDto {

    @Schema(description = "Card title", example = "Understanding Big-O Notation")
    private String title;

    @Schema(description = "Full explanation body text")
    private String body;

    @Schema(description = "Explanation level used", example = "BEGINNER")
    private String level;

    @Schema(description = "Key takeaway bullet points")
    private List<String> bulletPoints;
}
