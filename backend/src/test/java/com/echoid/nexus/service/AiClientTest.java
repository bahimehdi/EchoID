package com.echoid.nexus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiClientTest {

    private static final String BASE_URL = "http://localhost:8000";

    @Mock
    private RestClient.Builder restClientBuilder;
    @Mock
    private RestClient restClient;

    private AiClient aiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        when(restClientBuilder.baseUrl(BASE_URL)).thenReturn(restClientBuilder);
        when(restClientBuilder.build()).thenReturn(restClient);

        aiClient = new AiClient(BASE_URL, restClientBuilder, objectMapper);
    }

    @Test
    void postJson_whenServerUnreachable_throws() {
        assertThatThrownBy(() -> aiClient.postJson("/ai/explain", Map.of("question", "test")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("AI service call failed");
    }

    @Test
    void postJson_withSuccessfulResponse_returnsParsedMap() throws Exception {
        HttpClient mockHttpClient = mock(HttpClient.class);
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.statusCode()).thenReturn(200);
        when(mockResponse.body()).thenReturn("{\"result\":\"explanation\"}");
        when(mockHttpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenReturn(mockResponse);

        java.lang.reflect.Field httpClientField = AiClient.class.getDeclaredField("httpClient");
        httpClientField.setAccessible(true);
        httpClientField.set(aiClient, mockHttpClient);

        Map<String, Object> result = aiClient.postJson("/ai/explain", Map.of("question", "test"));

        assertThat(result).containsEntry("result", "explanation");
    }

    @Test
    void postJson_whenServerReturnsError_throws() throws Exception {
        HttpClient mockHttpClient = mock(HttpClient.class);
        HttpResponse<String> mockResponse = mock(HttpResponse.class);
        when(mockResponse.statusCode()).thenReturn(500);
        when(mockResponse.body()).thenReturn("Internal error");
        when(mockHttpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenReturn(mockResponse);

        java.lang.reflect.Field httpClientField = AiClient.class.getDeclaredField("httpClient");
        httpClientField.setAccessible(true);
        httpClientField.set(aiClient, mockHttpClient);

        assertThatThrownBy(() -> aiClient.postJson("/ai/explain", Map.of("question", "test")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("AI service returned 500");
    }

    @Test
    void getJson_usesRestClient() {
        RestClient.RequestHeadersUriSpec uriSpec = mock(RestClient.RequestHeadersUriSpec.class);
        RestClient.RequestHeadersSpec headersSpec = mock(RestClient.RequestHeadersSpec.class);
        RestClient.ResponseSpec responseSpec = mock(RestClient.ResponseSpec.class);

        doReturn(uriSpec).when(restClient).get();
        doReturn(headersSpec).when(uriSpec).uri(any(String.class));
        doReturn(responseSpec).when(headersSpec).retrieve();
        when(responseSpec.body(Object.class)).thenReturn(Map.of("key", "value"));

        Object result = aiClient.getJson("/ai/videos?q=maths");

        assertThat(result).isInstanceOf(Map.class);
        verify(restClient).get();
    }

    @Test
    void postMultipart_whenServerUnreachable_throws() {
        assertThatThrownBy(() ->
                aiClient.postMultipart("/ai/ocr/upload", new byte[]{1, 2, 3}, "test.png", "image/png"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("AI service multipart call failed");
    }
}
