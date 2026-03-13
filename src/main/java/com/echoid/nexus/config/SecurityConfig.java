package com.echoid.nexus.config;

import com.echoid.nexus.security.CustomOAuth2UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.DelegatingAuthenticationEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
            )
            .oauth2ResourceServer(rs -> rs.jwt(jwt -> {}))
            .exceptionHandling(ex -> {
                RequestMatcher jsonMatcher = new MediaTypeRequestMatcher(MediaType.APPLICATION_JSON);

                var jsonEntryPoint = new org.springframework.security.web.AuthenticationEntryPoint() {
                    @Override
                    public void commence(jakarta.servlet.http.HttpServletRequest request,
                                         jakarta.servlet.http.HttpServletResponse response,
                                         org.springframework.security.core.AuthenticationException authException)
                            throws java.io.IOException {
                        response.setStatus(401);
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                        Map<String, Object> body = new LinkedHashMap<>();
                        body.put("timestamp", OffsetDateTime.now().toString());
                        body.put("status", 401);
                        body.put("error", "Unauthorized");
                        body.put("message", "Authentication required");
                        body.put("path", request.getRequestURI());

                        objectMapper.writeValue(response.getOutputStream(), body);
                    }
                };

                LinkedHashMap<RequestMatcher, org.springframework.security.web.AuthenticationEntryPoint> entryPoints = new LinkedHashMap<>();
                entryPoints.put(jsonMatcher, jsonEntryPoint);

                var delegating = new DelegatingAuthenticationEntryPoint(entryPoints);
                delegating.setDefaultEntryPoint(new LoginUrlAuthenticationEntryPoint("/oauth2/authorization/google"));

                ex.authenticationEntryPoint(delegating);
            });

        return http.build();
    }
}
