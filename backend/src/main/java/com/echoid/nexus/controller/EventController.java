package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.EventRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/api/events")
@Slf4j
@Tag(name = "Events", description = "Unified event ingestion — single write path for all analytics data")
public class EventController {

    private static final Set<String> KNOWN = Set.of(
            "concept_query", "professor_upload", "notification_sent", "session_event"
    );

    @PostMapping
    @Operation(summary = "Ingest a behavioral event",
            description = "Append-only. Demo posture: validates discriminator and logs. Production "
                    + "swap-in routes each type to its persistence table (interactions, professor_uploads, "
                    + "notification_log, session_events).")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Event recorded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Unknown eventType")
    })
    public ResponseEntity<ApiResponse<Void>> ingestEvent(@Valid @RequestBody EventRequest request) {
        if (!KNOWN.contains(request.getEventType())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Unknown eventType: " + request.getEventType()));
        }
        log.info("Event ingested: type={} student={} course={} timestamp={}",
                request.getEventType(), request.getStudentId(), request.getCourseId(), request.getTimestamp());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(null, "Event recorded"));
    }
}
