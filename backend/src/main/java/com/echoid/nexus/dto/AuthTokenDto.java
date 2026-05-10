package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "JWT token pair returned on login or refresh")
public class AuthTokenDto {

    @Schema(description = "Short-lived JWT access token", example = "eyJhbGciOiJIUzI1NiIs...")
    private String accessToken;

    @Schema(description = "Opaque refresh token UUID for rotation", example = "550e8400-e29b-41d4-a716-446655440000")
    private String refreshToken;

    @Schema(description = "Access token lifetime in milliseconds", example = "86400000")
    private long expiresIn;

    @Builder.Default
    @Schema(description = "Token type — always Bearer", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Authenticated user profile")
    private UserProfileDto user;
}
