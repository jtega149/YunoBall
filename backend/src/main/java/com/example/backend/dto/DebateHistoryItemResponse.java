package com.example.backend.dto;

import java.time.LocalDateTime;

public class DebateHistoryItemResponse {
    private Long id;
    private String roomId;
    private String title;
    private LocalDateTime debateEndedAt;
    /** HOST or GUEST for the requesting user */
    private String myRole;
    /** WIN or LOSS for the requesting user (only when they were host or guest debater) */
    private String myResult;
    private String winnerUsername;
    private String hostUsername;
    private String guestUsername;

    public DebateHistoryItemResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getDebateEndedAt() {
        return debateEndedAt;
    }

    public void setDebateEndedAt(LocalDateTime debateEndedAt) {
        this.debateEndedAt = debateEndedAt;
    }

    public String getMyRole() {
        return myRole;
    }

    public void setMyRole(String myRole) {
        this.myRole = myRole;
    }

    public String getMyResult() {
        return myResult;
    }

    public void setMyResult(String myResult) {
        this.myResult = myResult;
    }

    public String getWinnerUsername() {
        return winnerUsername;
    }

    public void setWinnerUsername(String winnerUsername) {
        this.winnerUsername = winnerUsername;
    }

    public String getHostUsername() {
        return hostUsername;
    }

    public void setHostUsername(String hostUsername) {
        this.hostUsername = hostUsername;
    }

    public String getGuestUsername() {
        return guestUsername;
    }

    public void setGuestUsername(String guestUsername) {
        this.guestUsername = guestUsername;
    }
}
