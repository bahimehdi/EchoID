package com.echoid.nexus.service;

import com.echoid.nexus.dto.UserProfileDto;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public UserProfileDto getProfile(OAuth2User principal) {
        return UserProfileDto.builder()
                .email(principal.getAttribute("email"))
                .fullName(principal.getAttribute("name"))
                .picture(principal.getAttribute("picture"))
                .build();
    }
}
