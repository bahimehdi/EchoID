package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.EventRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "Unified event ingestion — single write path for all analytics data")
public class EventController {

    @PostMapping
    @Operation(summary = "Ingest a behavioral event",
            description = "Accepts concept_query, professor_upload, notification_sent, and session_event types. "
                    + "Routes each type to the correct table. Append-only — no update or delete routes exist. "
                    + "Both the mobile app and AI microservice write to this endpoint.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Event recorded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Unknown eventType or validation failure")
    })
    public ResponseEntity<ApiResponse<Void>> ingestEvent(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-15"));
    }
}
