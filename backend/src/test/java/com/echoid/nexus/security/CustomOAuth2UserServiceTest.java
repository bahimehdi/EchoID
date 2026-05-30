package com.echoid.nexus.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;

import static org.assertj.core.api.Assertions.assertThat;

class CustomOAuth2UserServiceTest {

    @Test
    void extendsDefaultOAuth2UserService() {
        CustomOAuth2UserService service = new CustomOAuth2UserService();
        assertThat(service).isInstanceOf(DefaultOAuth2UserService.class);
    }
}
