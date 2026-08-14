package com.autocare.backend.auth.service.impl;

import com.autocare.backend.auth.dto.GoogleIdentity;
import com.autocare.backend.auth.exception.GoogleAuthenticationException;
import com.autocare.backend.auth.service.GoogleIdentityVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
public class GoogleIdentityVerifierImpl implements GoogleIdentityVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleIdentityVerifierImpl(@Value("${google.client-id:dummy-client-id}") String googleClientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    @Override
    public GoogleIdentity verify(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new GoogleAuthenticationException("Google ID token is required.");
        }
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                log.warn("Google ID token verification failed: invalid signature, expired, or wrong audience.");
                throw new GoogleAuthenticationException("Invalid or expired Google ID token.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String sub = payload.getSubject();
            String email = payload.getEmail();
            Boolean emailVerified = payload.getEmailVerified();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String hostedDomain = payload.getHostedDomain();

            if (sub == null || sub.isBlank()) {
                throw new GoogleAuthenticationException("Google ID token payload is missing subject ('sub').");
            }

            if (email == null || email.isBlank()) {
                throw new GoogleAuthenticationException("Google ID token payload is missing email.");
            }

            return new GoogleIdentity(
                    sub,
                    email.trim().toLowerCase(),
                    Boolean.TRUE.equals(emailVerified),
                    name != null ? name.trim() : null,
                    pictureUrl,
                    hostedDomain
            );
        } catch (GoogleAuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Exception verifying Google ID token: {}", e.getMessage());
            throw new GoogleAuthenticationException("Failed to verify Google ID token.");
        }
    }
}
