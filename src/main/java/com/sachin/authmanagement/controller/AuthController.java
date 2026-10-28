
package com.sachin.authmanagement.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sachin.authmanagement.entity.User;
import com.sachin.authmanagement.security.JwtService;
import com.sachin.authmanagement.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(
                    request.name(),
                    request.email(),
                    request.password()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    Map.of(
                            "message", "User registered successfully",
                            "id", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail()
                    )
            );
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", exception.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {
        try {
            String token = authService.login(
                    request.email(),
                    request.password()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                            "token", token,
                            "tokenType", "Bearer"
                    )
            );
        } catch (RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("error", exception.getMessage())
            );
        }
    }

    public record RegisterRequest(
            String name,
            String email,
            String password) {
    }

    public record LoginRequest(
            String email,
            String password) {
    }
}

