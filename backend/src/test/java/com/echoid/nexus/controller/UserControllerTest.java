package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.UserProfileDto;
import com.echoid.nexus.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    private UserController controller;

    @BeforeEach
    void setUp() {
        controller = new UserController(userService);
    }

    @Test
    void me_returnsProfileForAuthenticatedUser() {
        UUID userId = UUID.randomUUID();
        UserProfileDto profile = UserProfileDto.builder()
                .id(userId)
                .email("student@ensa.uit.ac.ma")
                .fullName("Ahmed Benali")
                .role("STUDENT")
                .school("ENSA")
                .emailVerified(true)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userService.getProfile(any(UUID.class))).thenReturn(profile);
        Authentication auth = new UsernamePasswordAuthenticationToken(userId, null);

        ResponseEntity<ApiResponse<UserProfileDto>> response = controller.me(auth);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData().getEmail()).isEqualTo("student@ensa.uit.ac.ma");
        assertThat(response.getBody().getData().getRole()).isEqualTo("STUDENT");
    }
}
