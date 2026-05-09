package com.echoid.nexus.controller;

import com.echoid.nexus.dto.*;
import com.echoid.nexus.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Registration, login, token refresh, and logout — JWT-based, password + email verification")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates an account with @uit.ac.ma email validation. "
            + "User must verify email before login is allowed.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User created — verification email sent"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error (e.g. email format)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public ResponseEntity<ApiResponse<UserProfileDto>> register(
            @Valid @RequestBody RegisterRequest request) {
        UserProfileDto profile = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(profile, "Registration successful — check your email to verify"));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify email address", description = "Activates user account via token sent in verification email")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Email verified successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    public ResponseEntity<ApiResponse<Void>> verify(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok(null, "Email verified successfully — you can now login"));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Returns access + refresh token pair. "
            + "Fails if email not verified.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful — tokens returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials or email not verified")
    })
    public ResponseEntity<ApiResponse<AuthTokenDto>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthTokenDto tokens = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token", description = "Validates existing refresh token, deletes it, "
            + "and issues a new access + refresh token pair.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "New token pair issued"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<ApiResponse<AuthTokenDto>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        AuthTokenDto tokens = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token invalidated")
    })
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }
}
