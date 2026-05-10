package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.service.AiClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Forwards mobile traffic to the FastAPI AI microservice.
 *
 * For the demo all three endpoints are fixture-backed downstream
 * (see {@code .context/DEMO_FALLBACKS.md}); the proxy is a thin
 * passthrough so contract changes don't require backend redeploys.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI", description = "Backend proxy to the AI microservice — frontend never calls AI directly")
public class AiProxyController {

    private final AiClient ai;

    @PostMapping("/explain")
    @Operation(summary = "Concept explanation card",
            description = "Forwards to ai-service POST /explain/concept. Body: { conceptSlug, level }.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Explanation returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "502", description = "AI service unreachable")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> explain(@RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> normalized = new java.util.HashMap<>(body);
            if (!normalized.containsKey("conceptSlug") && normalized.containsKey("concept")) {
                normalized.put("conceptSlug", normalized.remove("concept"));
            }
            if (normalized.containsKey("level") && normalized.get("level") != null) {
                normalized.put("level", normalized.get("level").toString().toLowerCase());
            }
            return ResponseEntity.ok(ApiResponse.ok(ai.postJson("/explain/concept", normalized)));
        } catch (Exception e) {
            log.warn("AI explain proxy failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("AI service unreachable"));
        }
    }

    @PostMapping(value = "/ocr/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "OCR a handwritten document",
            description = "Forwards multipart upload to ai-service POST /ocr/process-notes.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OCR result returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Unsupported file type"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "502", description = "AI service unreachable")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadForOcr(
            @RequestParam("file") MultipartFile file) throws IOException {
        try {
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
            Map<String, Object> result = ai.postMultipart(
                    "/ocr/process-notes", file.getBytes(), filename, contentType);
            return ResponseEntity.ok(ApiResponse.ok(result));
        } catch (Exception e) {
            log.warn("AI OCR proxy failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("AI service unreachable"));
        }
    }

    @PostMapping("/videos")
    @Operation(summary = "Curated YouTube videos for a concept",
            description = "Forwards to ai-service POST /videos/search. Body: { conceptSlug }.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Video list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "502", description = "AI service unreachable")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchVideos(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(ai.postJson("/videos/search", body)));
        } catch (Exception e) {
            log.warn("AI videos proxy failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("AI service unreachable"));
        }
    }
}
