package com.example.backend.dto;

import java.util.Set;

// Pretty cool, doesnt need to initialize object of this, Springboot just detects
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private Set<String> role;

    public String getUsername() {
        return this.username;
    }
    public String getEmail() {
        return this.email;
    }
    public String getPassword() {
        return this.password;
    }
    public Set<String> getRole() {
        return this.role;
    }

    public SignupRequest() {}
}
