package com.example.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.LeaderboardResponse;
import com.example.backend.service.DebateService;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final DebateService debateService;

    public LeaderboardController(DebateService debateService) {
        this.debateService = debateService;
    }

    @GetMapping
    public LeaderboardResponse leaderboard(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return debateService.leaderboard(user.getUsername());
    }
}
