package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Registration request for new university accounts")
public class RegisterRequest {

    @NotBlank
    @Email
    @Schema(description = "Must end with @uit.ac.ma", example = "student@ensa.uit.ac.ma")
    private String email;

    @NotBlank
    @Size(min = 8, max = 128)
    @Schema(description = "Minimum 8 characters", example = "demo1234")
    private String password;

    @NotBlank
    @Schema(example = "Ahmed Benali")
    private String displayName;

    @NotBlank
    @Schema(description = "University school", example = "ENSA", allowableValues = {"ENSA", "EST", "FAC", "OTHER"})
    private String school;
}
