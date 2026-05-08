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
@Schema(description = "Result of OCR document processing")
public class OcrResultDto {

    @Schema(description = "Stored document ID (null if not persisted yet)")
    private UUID documentId;

    @Schema(description = "Extracted and cleaned text content")
    private String extractedText;

    @Schema(description = "Number of pages processed", example = "2")
    private int pageCount;

    @Schema(description = "OCR confidence score (0.0 to 1.0)", example = "0.94")
    private double confidence;
}
