package com.echoid.nexus.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig(null, null, null);

    @Test
    void passwordEncoder_encodesAndMatches() {
        BCryptPasswordEncoder encoder = (BCryptPasswordEncoder) securityConfig.passwordEncoder();

        String raw = "demo1234";
        String encoded = encoder.encode(raw);

        assertThat(encoded).isNotEqualTo(raw);
        assertThat(encoder.matches(raw, encoded)).isTrue();
        assertThat(encoder.matches("wrong", encoded)).isFalse();
    }
}
