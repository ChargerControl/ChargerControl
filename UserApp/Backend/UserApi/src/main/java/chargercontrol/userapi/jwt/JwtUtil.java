
package chargercontrol.userapi.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String secretKey = "b8f3e2c7a1d4e5f6b7c8a9e0d1f2c3b4";

    private static final long JWT_TOKEN_VALIDITY = 10 * 60 * 60 * 1000;


    public String generateToken(String email) {
        JwtBuilder jwt = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY))
                .signWith(generateJwtSecretKey(), SignatureAlgorithm.HS256);
        return jwt.compact();
    }


    public SecretKey generateJwtSecretKey() {

        byte[] keyBytes = secretKey.getBytes();


        byte[] keyBytesPadded = new byte[32];
        System.arraycopy(keyBytes, 0, keyBytesPadded, 0, Math.min(keyBytes.length, 32));


        return Keys.hmacShaKeyFor(keyBytesPadded);
    }



    public boolean validateToken(String token, UserDetails userDetails) {
        String email = extractEmail(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }


    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }


    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }


    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(generateJwtSecretKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

