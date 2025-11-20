package com.example.backend;

import org.springframework.web.bind.annotation.*;

@RestController // This annotation tells Spring that this class is a controller
@RequestMapping("/api") // Optional base path
public class HomeController {

    @GetMapping("/") // This annotation maps the root URL to this method
    public String index() {
        // Used to return the view for this
        return "Landing"; // This returns the name of the view (index.html)
    }

    @GetMapping("/login")
    public String login() {
        // Authentication handled by Spring Security
        return "Login";
    }
}
