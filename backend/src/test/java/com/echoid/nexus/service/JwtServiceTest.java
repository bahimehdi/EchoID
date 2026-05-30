package com.echoid.nexus.service;

import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String BASE64_SECRET = "dGhpcyBpcyBhIHRlc3Qgc2VjcmV0IGtleSBmb3IgdW5pdCB0ZXN0cyBvbmx5";
    private static final Duration ACCESS_TTL = Duration.ofMinutes(30);
    private static final Duration REFRESH_TTL = Duration.ofDays(7);

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(BASE64_SECRET, ACCESS_TTL, REFRESH_TTL, refreshTokenRepository);
    }

    @Test
    void generateAccessToken_containsCorrectClaims() {
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("student@ensa.uit.ac.ma")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateAccessToken(user);
        Claims claims = jwtService.validateAccessToken(token);

        assertThat(claims.getSubject()).isEqualTo(userId.toString());
        assertThat(claims.get("email", String.class)).isEqualTo("student@ensa.uit.ac.ma");
        assertThat(claims.get("role", String.class)).isEqualTo("STUDENT");
        assertThat(claims.getExpiration()).isNotNull();
    }

    @Test
    void validateAccessToken_withInvalidToken_throws() {
        assertThatThrownBy(() -> jwtService.validateAccessToken("invalid.jwt.token"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void isTokenValid_returnsTrueForValidToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@ensa.uit.ac.ma")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateAccessToken(user);

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalseForInvalidToken() {
        assertThat(jwtService.isTokenValid("bad.token.here")).isFalse();
    }

    @Test
    void isTokenValid_returnsFalseForNull() {
        assertThat(jwtService.isTokenValid(null)).isFalse();
    }

    @Test
    void generateRefreshToken_persistsAndReturnsUuid() {
        User user = User.builder().id(UUID.randomUUID()).email("test@ensa.uit.ac.ma").build();
        UUID tokenId = UUID.randomUUID();

        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> {
                    RefreshToken token = invocation.getArgument(0);
                    java.lang.reflect.Field tokenField = RefreshToken.class.getDeclaredField("token");
                    tokenField.setAccessible(true);
                    tokenField.set(token, tokenId);
                    return token;
                });

        String result = jwtService.generateRefreshToken(user);

        assertThat(result).isEqualTo(tokenId.toString());

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(captor.getValue().isExpired()).isFalse();
    }

    @Test
    void getAccessTokenTtlMillis_returnsConfiguredValue() {
        assertThat(jwtService.getAccessTokenTtlMillis()).isEqualTo(ACCESS_TTL.toMillis());
    }

    @Test
    void differentSigningKey_rejectsToken() {
        JwtService otherService = new JwtService(
                "Y2hhbmdlZCBzZWNyZXQga2V5IHRoYXQgaXMgbG9uZyBlbm91Z2ggZm9yIEhNQUM=",
                ACCESS_TTL, REFRESH_TTL, refreshTokenRepository);

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@ensa.uit.ac.ma")
                .role(UserRole.STUDENT)
                .build();

        String token = jwtService.generateAccessToken(user);

        assertThatThrownBy(() -> otherService.validateAccessToken(token))
                .isInstanceOf(JwtException.class);
    }
}
