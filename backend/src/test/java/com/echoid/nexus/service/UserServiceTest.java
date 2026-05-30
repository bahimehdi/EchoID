package com.echoid.nexus.service;

import com.echoid.nexus.dto.UserProfileDto;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
    }

    @Test
    void getProfile_returnsProfileForExistingUser() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("student@ensa.uit.ac.ma")
                .displayName("Ahmed Benali")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserProfileDto result = userService.getProfile(userId);

        assertThat(result.getId()).isEqualTo(userId);
        assertThat(result.getEmail()).isEqualTo("student@ensa.uit.ac.ma");
        assertThat(result.getFullName()).isEqualTo("Ahmed Benali");
        assertThat(result.getRole()).isEqualTo("STUDENT");
        assertThat(result.getSchool()).isEqualTo("ENSA");
        assertThat(result.isEmailVerified()).isTrue();
        assertThat(result.getCreatedAt()).isNotNull();
    }

    @Test
    void getProfile_throwsWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile(userId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(userId.toString());
    }

    @Test
    void getProfile_handlesNullSchool() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("prof@ensa.uit.ac.ma")
                .displayName("Professor")
                .role(UserRole.PROFESSOR)
                .school(null)
                .emailVerified(true)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        UserProfileDto result = userService.getProfile(userId);

        assertThat(result.getSchool()).isNull();
        assertThat(result.getRole()).isEqualTo("PROFESSOR");
    }
}
