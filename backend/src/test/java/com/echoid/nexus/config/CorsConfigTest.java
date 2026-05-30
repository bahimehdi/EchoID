package com.echoid.nexus.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CorsConfigTest {

    @Test
    void corsConfigurationSource_createsBeanWithAllowedOrigins() {
        CorsConfig config = new CorsConfig();
        java.lang.reflect.Field field;
        try {
            field = CorsConfig.class.getDeclaredField("allowedOrigins");
            field.setAccessible(true);
            field.set(config, List.of("http://localhost:3000"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        CorsConfigurationSource source = config.corsConfigurationSource();

        assertThat(source).isInstanceOf(UrlBasedCorsConfigurationSource.class);
        var corsConfig = ((UrlBasedCorsConfigurationSource) source).getCorsConfigurations().get("/**");
        assertThat(corsConfig).isNotNull();
        assertThat(corsConfig.getAllowedOrigins()).containsExactly("http://localhost:3000");
        assertThat(corsConfig.getAllowedMethods()).contains("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(corsConfig.getAllowedHeaders()).contains("*");
        assertThat(corsConfig.getAllowCredentials()).isTrue();
    }
}
