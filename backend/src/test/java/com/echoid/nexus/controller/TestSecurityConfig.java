package com.echoid.nexus.controller;

import com.echoid.nexus.security.JwtAuthenticationFilter;
import com.echoid.nexus.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Lightweight security config for @WebMvcTest tests.
 * Mirrors the real SecurityConfig's auth rules without requiring
 * OAuth2, CORS beans, or database-backed services.
 */
@TestConfiguration
@EnableWebSecurity
public class TestSecurityConfig {

    /**
     * @WebMvcTest auto-detects {@link JwtAuthenticationFilter} (a @Component), which
     * pulls in {@link JwtService}. Provide stubs so slice-test contexts boot.
     */
    @Bean
    public JwtService jwtService() {
        return Mockito.mock(JwtService.class);
    }

    /**
     * Replace the real filter with a no-op that always continues the chain.
     * The real one needs JwtService + a populated SecurityContext; in slice tests
     * we delegate auth to {@code @WithMockUser} instead.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(Mockito.mock(JwtService.class)) {
            @Override
            protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                    throws ServletException, IOException {
                chain.doFilter(req, res);
            }
        };
    }

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/events").permitAll()
                .requestMatchers("/api/lms/**").permitAll()
                .requestMatchers("/api/ai/**").permitAll()
                .requestMatchers("/api/students/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll()
            )
            .exceptionHandling(ex -> {
                ex.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                    Map<String, Object> body = new LinkedHashMap<>();
                    body.put("timestamp", OffsetDateTime.now().toString());
                    body.put("status", 401);
                    body.put("error", "Unauthorized");
                    body.put("message", "Authentication required");
                    body.put("path", request.getRequestURI());

                    new ObjectMapper().writeValue(response.getOutputStream(), body);
                });
            });

        return http.build();
    }
}
