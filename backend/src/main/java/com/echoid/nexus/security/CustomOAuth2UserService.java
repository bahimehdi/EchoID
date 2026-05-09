package com.echoid.nexus.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Placeholder OAuth2 user service.
 * The original implementation referenced a 'universities' table that no longer exists in the schema.
 * This will be properly re-implemented when OAuth2 login is added back.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Delegate to default — no custom DB upsert for now
        return super.loadUser(userRequest);
    }
}
