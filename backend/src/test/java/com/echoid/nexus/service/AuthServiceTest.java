package com.echoid.nexus.service;

import com.echoid.nexus.dto.AuthTokenDto;
import com.echoid.nexus.dto.LoginRequest;
import com.echoid.nexus.dto.RegisterRequest;
import com.echoid.nexus.dto.UserProfileDto;
import com.echoid.nexus.model.EmailVerificationToken;
import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.EmailVerificationTokenRepository;
import com.echoid.nexus.repository.RefreshTokenRepository;
import com.echoid.nexus.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, refreshTokenRepository,
                verificationTokenRepository, jwtService, passwordEncoder);
    }

    @Test
    void register_createsUserAndReturnsProfile() {
        RegisterRequest request = RegisterRequest.builder()
                .email("student@ensa.uit.ac.ma")
                .password("password123")
                .displayName("Ahmed Benali")
                .school("ENSA")
                .build();

        when(userRepository.existsByEmail("student@ensa.uit.ac.ma")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(saved, UUID.randomUUID());
            return saved;
        });
        when(verificationTokenRepository.save(any(EmailVerificationToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto result = authService.register(request);

        assertThat(result.getEmail()).isEqualTo("student@ensa.uit.ac.ma");
        assertThat(result.getFullName()).isEqualTo("Ahmed Benali");
        assertThat(result.getRole()).isEqualTo("STUDENT");
        assertThat(result.getSchool()).isEqualTo("ENSA");
        assertThat(result.isEmailVerified()).isFalse();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getPasswordHash()).isEqualTo("encoded");
        assertThat(userCaptor.getValue().getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(userCaptor.getValue().getSchool()).isEqualTo(SchoolEnum.ENSA);
    }

    @Test
    void register_rejectsNonUitEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .email("student@gmail.com")
                .password("password123")
                .displayName("Ahmed")
                .school("ENSA")
                .build();

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("uit.ac.ma");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_rejectsDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .email("student@ensa.uit.ac.ma")
                .password("password123")
                .displayName("Ahmed")
                .school("ENSA")
                .build();

        when(userRepository.existsByEmail("student@ensa.uit.ac.ma")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(AuthService.EmailAlreadyExistsException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_rejectsBlankPassword() {
        RegisterRequest request = RegisterRequest.builder()
                .email("student@ensa.uit.ac.ma")
                .password("   ")
                .displayName("Ahmed")
                .school("ENSA")
                .build();

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Password must not be blank");
    }

    @Test
    void verifyEmail_withValidToken_marksEmailVerified() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("student@ensa.uit.ac.ma")
                .emailVerified(false)
                .build();
        UUID tokenId = UUID.randomUUID();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(tokenId)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusHours(1))
                .build();

        when(verificationTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(token));

        authService.verifyEmail(tokenId.toString());

        assertThat(user.getEmailVerified()).isTrue();
        verify(userRepository).save(user);
        verify(verificationTokenRepository).delete(token);
    }

    @Test
    void verifyEmail_withExpiredToken_throws() {
        User user = User.builder().id(UUID.randomUUID()).email("student@ensa.uit.ac.ma").build();
        UUID tokenId = UUID.randomUUID();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(tokenId)
                .user(user)
                .expiresAt(OffsetDateTime.now().minusHours(1))
                .build();

        when(verificationTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.verifyEmail(tokenId.toString()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");

        verify(verificationTokenRepository).delete(token);
    }

    @Test
    void verifyEmail_withInvalidTokenFormat_throws() {
        assertThatThrownBy(() -> authService.verifyEmail("not-a-uuid"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid verification token format");
    }

    @Test
    void login_withValidCredentials_returnsTokenPair() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("student@ensa.uit.ac.ma")
                .passwordHash("encoded-password")
                .displayName("Ahmed Benali")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build();
        LoginRequest request = LoginRequest.builder()
                .email("student@ensa.uit.ac.ma ")
                .password("password123")
                .build();

        when(userRepository.findByEmail("student@ensa.uit.ac.ma")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded-password")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtService.getAccessTokenTtlMillis()).thenReturn(3600000L);

        AuthTokenDto result = authService.login(request);

        assertThat(result.getAccessToken()).isEqualTo("access-token");
        assertThat(result.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(result.getExpiresIn()).isEqualTo(3600000L);
        assertThat(result.getUser()).isNotNull();
        assertThat(result.getUser().getEmail()).isEqualTo("student@ensa.uit.ac.ma");
    }

    @Test
    void login_withWrongPassword_throws() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("student@ensa.uit.ac.ma")
                .passwordHash("encoded-password")
                .emailVerified(true)
                .build();
        LoginRequest request = LoginRequest.builder()
                .email("student@ensa.uit.ac.ma")
                .password("wrong-password")
                .build();

        when(userRepository.findByEmail("student@ensa.uit.ac.ma")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_withUnverifiedEmail_throws() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("student@ensa.uit.ac.ma")
                .passwordHash("encoded")
                .emailVerified(false)
                .build();
        LoginRequest request = LoginRequest.builder()
                .email("student@ensa.uit.ac.ma")
                .password("password123")
                .build();

        when(userRepository.findByEmail("student@ensa.uit.ac.ma")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "encoded")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Email not verified");
    }

    @Test
    void login_withNonExistentEmail_throws() {
        LoginRequest request = LoginRequest.builder()
                .email("unknown@ensa.uit.ac.ma")
                .password("password123")
                .build();

        when(userRepository.findByEmail("unknown@ensa.uit.ac.ma")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void refresh_withValidToken_returnsNewTokenPair() {
        User user = User.builder().id(UUID.randomUUID()).email("student@ensa.uit.ac.ma").build();
        UUID tokenId = UUID.randomUUID();
        RefreshToken existing = RefreshToken.builder()
                .token(tokenId)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .build();

        when(refreshTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(existing));
        when(jwtService.generateAccessToken(user)).thenReturn("new-access");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh");
        when(jwtService.getAccessTokenTtlMillis()).thenReturn(3600000L);

        AuthTokenDto result = authService.refresh(tokenId.toString());

        assertThat(result.getAccessToken()).isEqualTo("new-access");
        assertThat(result.getRefreshToken()).isEqualTo("new-refresh");
        verify(refreshTokenRepository).delete(existing);
    }

    @Test
    void refresh_withExpiredToken_throws() {
        User user = User.builder().id(UUID.randomUUID()).email("student@ensa.uit.ac.ma").build();
        UUID tokenId = UUID.randomUUID();
        RefreshToken expired = RefreshToken.builder()
                .token(tokenId)
                .user(user)
                .expiresAt(OffsetDateTime.now().minusDays(1))
                .build();

        when(refreshTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authService.refresh(tokenId.toString()))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("expired");

        verify(refreshTokenRepository).delete(expired);
    }

    @Test
    void refresh_withInvalidTokenFormat_throws() {
        assertThatThrownBy(() -> authService.refresh("not-a-uuid"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void logout_withValidToken_deletesToken() {
        UUID tokenId = UUID.randomUUID();
        RefreshToken token = RefreshToken.builder()
                .token(tokenId)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByToken(tokenId)).thenReturn(Optional.of(token));

        authService.logout(tokenId.toString());

        verify(refreshTokenRepository).delete(token);
    }

    @Test
    void logout_withMalformedToken_doesNothing() {
        authService.logout("not-a-uuid");
        verify(refreshTokenRepository, never()).findByToken(any());
        verify(refreshTokenRepository, never()).delete(any());
    }
}
