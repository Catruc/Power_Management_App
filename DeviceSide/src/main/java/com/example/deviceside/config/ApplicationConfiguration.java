package com.example.deviceside.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class ApplicationConfiguration {

    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        // Provide password encoder if needed for JWT token validation compatibility
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        // Placeholder UserDetailsService for compatibility; JWT will handle actual authentication
        return username -> {
            throw new UnsupportedOperationException("UserDetailsService is not used in this microservice.");
        };
    }
}