package com.example.backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Class is for JWT authentication filter which intercepts incoming HTTP requests to validate JWT tokens
public class JwtAuthFilter extends OncePerRequestFilter{
    // Autowired means that Spring will automatically inject the required dependencies
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    // Function will execute for every incoming HTTP request
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtil.validateToken(jwt)) {
                String email = jwtUtil.getEmailFromToken(jwt);
                // Perform authentication and authorization based on the email
                // For example, you can set the authenticated user in the SecurityContext
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email); // Load user details from user service
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()); // Create authentication token
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request)); // Attaches request details to the authentication token like IP address, session ID, etc.
                SecurityContextHolder.getContext().setAuthentication(authenticationToken); // Set the authentication in the SecurityContext, which is used by Spring Security to authorize the user
            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token"); // Responds with 401 unauthorized if token is invalid
            return;
        }
        filterChain.doFilter(request, response); // pass request to next filter, or to the resource if there are no more filters
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
