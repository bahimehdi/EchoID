package com.echoid.nexus.controller;

import com.echoid.nexus.dto.AdminHealthDto;
import com.echoid.nexus.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Administrator platform health and monitoring — requires ADMIN role")
public class AdminController {

    @GetMapping("/health")
    @Operation(summary = "Platform health overview",
            description = "Returns active student count, upload count, at-risk count, service statuses, "
                    + "and last event timestamp for the admin dashboard summary row.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Health data returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Requires ADMIN role")
    })
    public ResponseEntity<ApiResponse<AdminHealthDto>> platformHealth() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-33"));
    }
}
