package com.example.backend;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/signup")
    public String Signup(@RequestBody String userInfo) {
        // Handle user signup logic here
        return "User signed up successfully!";
    }

    @PostMapping("/login")
    public String Login(@RequestBody String credentials) {
        // Handle user login logic here
        return "User logged in successfully!";
    }
}
