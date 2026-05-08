package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.UserProfileDto;
import com.echoid.nexus.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile retrieval — used by frontend for session bootstrap")
public class UserController {

    private final UserService userService;

    /**
     * Returns the authenticated user's profile from the OAuth2 principal.
     * In future sprints this will also include university info, enrolled courses count,
     * and engagement statistics.
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user profile",
            description = "Returns the authenticated user's profile including role, school, "
                    + "and email verification status. Used by frontends for session bootstrap and role-gated routing.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User profile returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<UserProfileDto>> me(@AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(principal)));
    }
}
