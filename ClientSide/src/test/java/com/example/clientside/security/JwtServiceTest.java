package com.example.clientside.security;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void testIncompleteTokenValidation() {
        // Mocking UserDetails
        UserDetails userDetails = User.builder()
                .username("testUser")
                .password("password")
                .roles("USER")
                .build();

        // Mock secret key and expiration
        jwtService.secretKey = "A9d3vvPddBEKaOSmqa6dsNOlQB6XEfLHL9H6tPYX1IU=";
        jwtService.jwtExpiration = 3600000;

        // Generate token
        String token = jwtService.generateToken(userDetails);

        // Validate the original token
        boolean isOriginalValid = jwtService.isTokenValid(token, userDetails);
        System.out.println("Original Token: " + token);
        System.out.println("Is Original Token Valid? " + isOriginalValid);
        assertTrue(isOriginalValid, "Original token should be valid");

        // Delete part of the token (e.g., remove some characters from the signature)
        String[] tokenParts = token.split("\\.");
        String incompleteSignature = tokenParts[2].substring(0, tokenParts[2].length() - 5); // Remove last 5 characters
        String incompleteToken = tokenParts[0] + "." + tokenParts[1] + "." + incompleteSignature;

        // Validate the incomplete token
        boolean isIncompleteValid = false;
        try {
            isIncompleteValid = jwtService.isTokenValid(incompleteToken, userDetails);
        } catch (Exception e) {
            System.out.println("Incomplete Token Validation Failed: " + e.getMessage());
        }
        System.out.println("Incomplete Token: " + incompleteToken);
        System.out.println("Is Incomplete Token Valid? " + isIncompleteValid);

        // Assert that the incomplete token is invalid
        assertFalse(isIncompleteValid, "Incomplete token should not be valid");
    }


}
