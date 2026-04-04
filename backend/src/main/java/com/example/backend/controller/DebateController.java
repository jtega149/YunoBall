package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CreateDebateRequest;
import com.example.backend.dto.DebateHistoryItemResponse;
import com.example.backend.dto.DebateRoomResponse;
import com.example.backend.service.DebateService;
import com.example.backend.service.DebateSessionService;

@RestController
@RequestMapping("/api/debates")
public class DebateController {

    private final DebateService debateService;
    private final DebateSessionService debateSessionService;

    public DebateController(DebateService debateService, DebateSessionService debateSessionService) {
        this.debateService = debateService;
        this.debateSessionService = debateSessionService;
    }

    @PostMapping
    public ResponseEntity<DebateRoomResponse> create(@AuthenticationPrincipal UserDetails user,
            @RequestBody CreateDebateRequest body) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(debateService.create(user.getUsername(), body));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<DebateRoomResponse> get(@PathVariable String roomId) {
        debateSessionService.ensureSession(roomId);
        return ResponseEntity.ok(debateService.getByRoomId(roomId));
    }

    /** Host ends the debate (closes room in DB + clears live session). */
    @PostMapping("/{roomId}/end")
    public ResponseEntity<Void> endRoom(@PathVariable String roomId, @AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        debateService.endRoomAsHostByEmail(roomId, user.getUsername());
        debateSessionService.notifyRoomClosedFromRest(roomId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public List<DebateRoomResponse> search(@RequestParam(name = "q", required = false) String q) {
        return debateService.searchPublic(q);
    }

    @GetMapping("/recommended")
    public List<DebateRoomResponse> recommended() {
        return debateService.recommended();
    }

    @GetMapping("/history/me")
    public List<DebateHistoryItemResponse> myHistory(@AuthenticationPrincipal UserDetails user) {
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return debateService.historyForUser(user.getUsername());
    }
}
