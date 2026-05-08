package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Refresh token request for token rotation")
public class RefreshRequest {

    @NotBlank
    @Schema(description = "Opaque refresh token UUID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String refreshToken;
}
