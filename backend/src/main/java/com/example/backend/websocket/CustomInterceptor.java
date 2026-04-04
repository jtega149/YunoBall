package com.example.backend.websocket;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

public class CustomInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest req, 
            ServerHttpResponse res, 
            WebSocketHandler handler,
            Map<String, Object> attributes) throws Exception {
        
        if (req instanceof ServletServerHttpRequest servReq) {
            HttpServletRequest request = servReq.getServletRequest();
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                return false;
            }
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    String jwt = cookie.getValue();
                    attributes.put("jwt", jwt); // Store JWT in attributes for later use
                    return true;
                }
            }
        }
            
        return false; // Return false to abort the handshake if no JWT cookie is found
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest req, ServerHttpResponse res, WebSocketHandler handler, Exception ex) {
        System.out.println("After Handshake");
    }
}
