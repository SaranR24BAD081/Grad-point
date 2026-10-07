package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        String username = (principal instanceof UserDetails)
                ? ((UserDetails) principal).getUsername()
                : authentication.getName();

        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(signingKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean validateToken(String authToken) {
        try {
            parseClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.debug("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return validateToken(token) && extractUsername(token).equals(userDetails.getUsername());
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
