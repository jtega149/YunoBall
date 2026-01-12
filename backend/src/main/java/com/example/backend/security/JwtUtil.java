package com.example.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long expiration_time = 1000 * 60 * 60; // 1 hour

    public String generateToken(Authentication authentication) {
        String email = authentication.getName(); // getName returns the principals name, which is the email in our case
        return Jwts.builder() // Activatte build mode for jwt
                .setSubject(email) // Basically the payload of the jwt
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration_time))
                .signWith(key, SignatureAlgorithm.HS256) // Using HMAC SHA-256 for signing the jwt
                .compact(); // Stops build mode and compacts the jwt into a
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder() // Activates parse mode for jwt
                .setSigningKey(key) 
                .build()
                .parseClaimsJws(token) // Verifies signature, then expiration, decodes header and payload
                .getBody() // Basically gets the payload of the jwt
                .getSubject(); // Returns the subject of the jwt
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder() // Activates parse mode for jwt
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token); // Verifies signature, then expiration, decodes header and payload
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
