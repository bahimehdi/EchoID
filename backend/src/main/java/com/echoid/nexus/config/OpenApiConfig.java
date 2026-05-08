package com.echoid.nexus.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI echoIdOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("EchoID Nexus API")
                        .description("AI-powered academic assistant for UIT University. "
                                + "This document is the single source of truth for all API contracts. "
                                + "No endpoint is implemented before it appears here.")
                        .version("0.1.0")
                        .contact(new Contact()
                                .name("Team Neurorise")
                                .email("admin@uit.ac.ma")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development"),
                        new Server().url("http://backend:8080").description("Docker internal")
                ));
    }
}
