package com.echoid.nexus.service;

import com.echoid.nexus.dto.*;
import com.echoid.nexus.model.EmailVerificationToken;
import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.EmailVerificationTokenRepository;
import com.echoid.nexus.repository.RefreshTokenRepository;
import com.echoid.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String EMAIL_DOMAIN_SUFFIX = "uit.ac.ma";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // ---- Registration ----

    @Transactional
    public UserProfileDto register(RegisterRequest request) {
        // 1. Validate email domain
        String email = request.getEmail().trim().toLowerCase();
        if (!email.endsWith("@" + EMAIL_DOMAIN_SUFFIX) && !email.endsWith("." + EMAIL_DOMAIN_SUFFIX)) {
            throw new IllegalArgumentException(
                    "Email must belong to the " + EMAIL_DOMAIN_SUFFIX + " domain (e.g. student@ensa.uit.ac.ma or prof@uit.ac.ma)");
        }

        // 2. Check duplicate
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        // 3. Enforce non-null password at service level
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password must not be blank");
        }

        // 4. Build and save user
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role(UserRole.STUDENT)
                .school(SchoolEnum.valueOf(request.getSchool().toUpperCase()))
                .emailVerified(false)
                .build();
        user = userRepository.save(user);

        // 5. Create email verification token (24h TTL)
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build();
        verificationToken = verificationTokenRepository.save(verificationToken);

        // 6. Log verification link (real email sending deferred to a later ticket)
        log.info("╔══════════════════════════════════════════════════════════════╗");
        log.info("║ EMAIL VERIFICATION (dev mode — not actually sent)           ║");
        log.info("║ User:  {}                                                   ", email);
        log.info("║ Token: {}                                                   ", verificationToken.getToken());
        log.info("║ Link:  GET /api/auth/verify?token={}                        ", verificationToken.getToken());
        log.info("╚══════════════════════════════════════════════════════════════╝");

        return toProfile(user);
    }

    // ---- Email Verification ----

    @Transactional
    public void verifyEmail(String tokenStr) {
        UUID tokenId;
        try {
            tokenId = UUID.fromString(tokenStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid verification token format");
        }

        EmailVerificationToken token = verificationTokenRepository.findByToken(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (token.isExpired()) {
            verificationTokenRepository.delete(token);
            throw new IllegalArgumentException("Verification token has expired — please register again");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        verificationTokenRepository.delete(token);

        log.info("Email verified for user: {}", user.getEmail());
    }

    // ---- Login ----

    @Transactional
    public AuthTokenDto login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Verify password
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check email verified
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadCredentialsException("Email not verified — check your inbox");
        }

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthTokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getAccessTokenTtlMillis())
                .build();
    }

    // ---- Refresh ----

    @Transactional
    public AuthTokenDto refresh(String refreshTokenStr) {
        UUID tokenId;
        try {
            tokenId = UUID.fromString(refreshTokenStr);
        } catch (IllegalArgumentException e) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        RefreshToken existing = refreshTokenRepository.findByToken(tokenId)
                .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));

        if (existing.isExpired()) {
            refreshTokenRepository.delete(existing);
            throw new BadCredentialsException("Refresh token expired — please login again");
        }

        User user = existing.getUser();

        // Rotate: delete old, issue new pair
        refreshTokenRepository.delete(existing);

        String accessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return AuthTokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(jwtService.getAccessTokenTtlMillis())
                .build();
    }

    // ---- Logout ----

    @Transactional
    public void logout(String refreshTokenStr) {
        UUID tokenId;
        try {
            tokenId = UUID.fromString(refreshTokenStr);
        } catch (IllegalArgumentException e) {
            return; // Silently ignore malformed tokens on logout
        }
        refreshTokenRepository.findByToken(tokenId).ifPresent(refreshTokenRepository::delete);
    }

    // ---- Helpers ----

    private UserProfileDto toProfile(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getDisplayName())
                .role(user.getRole().name())
                .school(user.getSchool() != null ? user.getSchool().name() : null)
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    // ---- Custom Exception ----

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String email) {
            super("An account with email '" + email + "' already exists");
        }
    }
}
