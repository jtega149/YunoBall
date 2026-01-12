package com.example.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController // This annotation tells Spring that this class is a controller
public class HomeController {

    @PreAuthorize("isAnonymous()") // Only allow access to unauthenticated users
    @GetMapping("/") // This annotation maps the root URL to this method
    public String index() {
        // Used to return the view for this
        return "Landing"; // This returns the name of the view (index.html)
    }

    @PreAuthorize("isAuthenticated()") // Only allow access to authenticated users
    @GetMapping("/dashboard")
    public String dashboard() {
        return "Dashboard";
    }
}
