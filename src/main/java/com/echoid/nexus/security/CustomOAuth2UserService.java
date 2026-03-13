package com.echoid.nexus.security;

import com.echoid.nexus.model.University;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.UniversityRepository;
import com.echoid.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String sub = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");

        if (email == null || !email.contains("@")) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_email"), "Email not available from OAuth provider");
        }

        String domain = email.substring(email.indexOf('@') + 1);

        University university = universityRepository.findByDomain(domain)
                .orElseThrow(() -> new OAuth2AuthenticationException(
                        new OAuth2Error("unauthorized_domain"), "Email domain not authorized"));

        userRepository.findByOauthSubject(sub).ifPresentOrElse(
                existingUser -> {
                    existingUser.setLastLoginAt(OffsetDateTime.now());
                    userRepository.save(existingUser);
                },
                () -> {
                    User newUser = User.builder()
                            .university(university)
                            .email(email)
                            .fullName(name)
                            .role(UserRole.STUDENT)
                            .oauthProvider(userRequest.getClientRegistration().getRegistrationId())
                            .oauthSubject(sub)
                            .lastLoginAt(OffsetDateTime.now())
                            .build();
                    userRepository.save(newUser);
                }
        );

        return oAuth2User;
    }
}
