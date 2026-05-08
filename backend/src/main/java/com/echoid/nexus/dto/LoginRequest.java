package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Login credentials")
public class LoginRequest {

    @NotBlank
    @Email
    @Schema(example = "student@ensa.uit.ac.ma")
    private String email;

    @NotBlank
    @Schema(example = "demo1234")
    private String password;
}
