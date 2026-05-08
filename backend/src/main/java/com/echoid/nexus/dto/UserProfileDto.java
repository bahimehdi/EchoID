package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authenticated user profile")
public class UserProfileDto {

    @Schema(description = "User ID")
    private UUID id;

    @Schema(description = "University email", example = "student@ensa.uit.ac.ma")
    private String email;

    @Schema(description = "Display name", example = "Ahmed Benali")
    private String fullName;

    @Schema(description = "Profile picture URL (nullable)")
    private String picture;

    @Schema(description = "User role", example = "STUDENT", allowableValues = {"STUDENT", "PROFESSOR", "ADMIN"})
    private String role;

    @Schema(description = "University school", example = "ENSA", allowableValues = {"ENSA", "EST", "FAC", "OTHER"})
    private String school;

    @Schema(description = "Whether email has been verified", example = "true")
    private boolean emailVerified;

    @Schema(description = "Account creation timestamp")
    private OffsetDateTime createdAt;
}
