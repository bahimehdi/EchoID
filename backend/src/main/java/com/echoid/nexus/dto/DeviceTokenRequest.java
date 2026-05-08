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
@Schema(description = "Push notification device token registration")
public class DeviceTokenRequest {

    @NotBlank
    @Schema(description = "Expo push token or FCM token", example = "ExponentPushToken[xxxxxxxxxxxxxx]")
    private String token;

    @NotBlank
    @Schema(description = "Device platform", allowableValues = {"IOS", "ANDROID"}, example = "ANDROID")
    private String platform;
}
