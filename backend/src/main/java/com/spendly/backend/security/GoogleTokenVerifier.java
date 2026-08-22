package com.spendly.backend.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifies Google Sign-In ID tokens server-side. The frontend uses Google
 * Identity Services to get an idToken, sends it here - we never trust
 * anything in the token until Google's library has verified its signature,
 * audience, and expiry.
 */
@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${spendly.google.client-id}") String googleClientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    /**
     * @return the verified payload (contains email, sub/googleId, name, etc.)
     * @throws IllegalArgumentException if the token is missing, expired, or invalid
     */
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | java.io.IOException e) {
            throw new IllegalArgumentException("Could not verify Google token", e);
        }
    }
}