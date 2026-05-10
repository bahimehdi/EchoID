package com.echoid.nexus.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

/**
 * Thin HTTP client for the FastAPI AI microservice.
 *
 * postJson uses Java's native HttpClient (java.net.http) to avoid Spring
 * RestClient's message-converter selection issues with Map bodies.
 * postMultipart keeps RestClient because multipart assembly is convenient there.
 */
@Service
@Slf4j
public class AiClient {

    private final String baseUrl;
    private final HttpClient httpClient;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiClient(@Value("${app.ai-service.url:http://localhost:8000}") String baseUrl,
                    RestClient.Builder builder,
                    ObjectMapper objectMapper) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        this.restClient = builder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        log.info("AiClient configured for {}", baseUrl);
    }

    public Map<String, Object> postJson(String path, Object body) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new RuntimeException("AI service returned " + response.statusCode() + ": " + response.body());
            }
            return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("AI service call failed: " + e.getMessage(), e);
        }
    }

    public Object getJson(String path) {
        return restClient.get()
                .uri(path)
                .retrieve()
                .body(Object.class);
    }

    public Map<String, Object> postMultipart(String path, byte[] fileBytes, String filename, String contentType) {
        try {
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(contentType));
            parts.add("file", new org.springframework.http.HttpEntity<>(resource, fileHeaders));

            return restClient.post()
                    .uri(path)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(parts)
                    .retrieve()
                    .body(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("AI multipart call failed: {}", e.getMessage());
            throw new RuntimeException("AI service multipart call failed", e);
        }
    }
}
