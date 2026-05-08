package com.echoid.nexus.controller;

import com.echoid.nexus.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "Backend proxy to the AI microservice — frontend never calls AI directly")
public class AiProxyController {

    @PostMapping("/explain")
    @Operation(summary = "Get AI concept explanation",
            description = "Proxies to AI service /explain/concept. Returns a structured explanation card. "
                    + "Falls back to hardcoded card if LLM is unavailable.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Explanation card returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<ApiResponse<ExplanationCardDto>> explain(
            @Valid @RequestBody ExplainRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-19"));
    }

    @PostMapping(value = "/ocr/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload document for OCR processing",
            description = "Proxies to AI service /ocr/process-notes. Accepts PDF or image uploads. "
                    + "Returns structured text output. Falls back to hardcoded result if OCR engine unavailable.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OCR result returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Unsupported file type")
    })
    public ResponseEntity<ApiResponse<OcrResultDto>> uploadForOcr(
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID courseId,
            @RequestParam UUID sectionId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-20"));
    }

    @PostMapping("/videos")
    @Operation(summary = "Search YouTube videos for a concept",
            description = "Proxies to AI service /explain/videos. Returns 3–5 relevant videos. "
                    + "Falls back to hardcoded videos if YouTube API quota is exhausted.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Video list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error")
    })
    public ResponseEntity<ApiResponse<List<VideoResultDto>>> searchVideos(
            @Valid @RequestBody VideoSearchRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-21"));
    }
}
