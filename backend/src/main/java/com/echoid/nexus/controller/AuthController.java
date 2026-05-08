package com.echoid.nexus.controller;

import com.echoid.nexus.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Registration, login, token refresh, and logout — JWT-based, password + email verification")
public class AuthController {

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates an account with @uit.ac.ma email validation. "
            + "User must verify email before login is allowed.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created — verification email sent"),
            @ApiResponse(responseCode = "400", description = "Validation error (e.g. email format)"),
            @ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public ResponseEntity<com.echoid.nexus.dto.ApiResponse<UserProfileDto>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(com.echoid.nexus.dto.ApiResponse.error("Not implemented — see KAN-8"));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify email address", description = "Activates user account via token sent in verification email")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    public ResponseEntity<com.echoid.nexus.dto.ApiResponse<Void>> verify(
            @RequestParam String token) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(com.echoid.nexus.dto.ApiResponse.error("Not implemented — see KAN-8"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Returns access + refresh token pair. "
            + "Fails if email not verified.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful — tokens returned"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials or email not verified")
    })
    public ResponseEntity<com.echoid.nexus.dto.ApiResponse<AuthTokenDto>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(com.echoid.nexus.dto.ApiResponse.error("Not implemented — see KAN-9"));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token", description = "Validates existing refresh token, deletes it, "
            + "and issues a new access + refresh token pair.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "New token pair issued"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<com.echoid.nexus.dto.ApiResponse<AuthTokenDto>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(com.echoid.nexus.dto.ApiResponse.error("Not implemented — see KAN-9"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token invalidated"),
            @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    public ResponseEntity<com.echoid.nexus.dto.ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(com.echoid.nexus.dto.ApiResponse.error("Not implemented — see KAN-9"));
    }
}
