package com.hdas;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    
    @Test
    public void testPasswordMatching() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String plainPassword = "admin123";
        String storedHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        
        System.out.println("Plain password: " + plainPassword);
        System.out.println("Stored hash: " + storedHash);
        System.out.println("Matches: " + encoder.matches(plainPassword, storedHash));
        
        // Generate new hash for verification
        String newHash = encoder.encode(plainPassword);
        System.out.println("New hash: " + newHash);
        System.out.println("New hash matches: " + encoder.matches(plainPassword, newHash));
    }
}
