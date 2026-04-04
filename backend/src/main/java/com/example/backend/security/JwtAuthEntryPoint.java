package com.example.backend.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Writes a JSON body for 401 responses. {@link HttpServletResponse#sendError(int, String)} often yields an empty body
 * in the browser for API calls, which makes debugging hard.
 */
@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public JwtAuthEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String msg = authException != null && authException.getMessage() != null ? authException.getMessage()
                : "Authentication is required for this resource.";
        String ex =
                authException != null ? authException.getClass().getSimpleName() : "AuthenticationException";

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 401);
        body.put("error", "Unauthorized");
        body.put("message", msg);
        body.put("exception", ex);
        body.put("path", request.getRequestURI());
        body.put("method", request.getMethod());
        if (request.getRequestURI() != null && request.getRequestURI().startsWith("/api/auth")) {
            body.put("hint",
                    "If this was a signup/login request, the path should be permitted by SecurityConfig; "
                            + "check for a stale server, wrong port, or extra Spring Security filter chain.");
        }

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
