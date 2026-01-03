package com.example.backend.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String accessToken;
    private String tokenType;
}
