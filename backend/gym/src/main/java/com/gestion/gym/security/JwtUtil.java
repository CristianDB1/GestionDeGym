package com.gestion.gym.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "ClaveSecretaSuperSeguraParaJWTQueDebeSerMuyLarga";
    private static final long EXPIRATION_TIME = 86400000; // 1 día en milisegundos

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    /** Genera un token JWT basado en el username */
    public String generateToken(String username, String rol) {
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    /** Extrae el nombre de usuario del token */
    public String extractUsername(String token) {
        return parseToken(token).getSubject();
    }

    /** Valida si un token es correcto y no ha expirado */
    public boolean validateToken(String token) {
        try {
            return !parseToken(token).getExpiration().before(new Date());
        } catch (JwtException e) {
            return false;
        }
    }

    /** Parsea el token JWT y devuelve los claims (información del token) */
    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
