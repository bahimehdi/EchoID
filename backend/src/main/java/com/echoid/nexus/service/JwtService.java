package com.echoid.nexus.service;

import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final Duration accessTokenTtl;
    private final Duration refreshTokenTtl;
    private final RefreshTokenRepository refreshTokenRepository;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-ttl:30m}") Duration accessTokenTtl,
            @Value("${app.jwt.refresh-token-ttl:7d}") Duration refreshTokenTtl,
            RefreshTokenRepository refreshTokenRepository) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessTokenTtl = accessTokenTtl;
        this.refreshTokenTtl = refreshTokenTtl;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Generate a signed JWT access token with userId, email, and role claims.
     */
    public String generateAccessToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenTtl.toMillis());

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Create an opaque UUID refresh token, persist it, and return the UUID string.
     */
    @Transactional
    public String generateRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .expiresAt(OffsetDateTime.now().plus(refreshTokenTtl))
                .build();
        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        return saved.getToken().toString();
    }

    /**
     * Validate and parse an access token. Returns claims or throws.
     */
    public Claims validateAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if an access token string is valid (non-expired, correct signature).
     */
    public boolean isTokenValid(String token) {
        try {
            validateAccessToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public long getAccessTokenTtlMillis() {
        return accessTokenTtl.toMillis();
    }
}
