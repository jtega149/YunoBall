package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DebateRoomResponse {
    private String roomId;
    private String title;
    private String description;
    private String visibility;
    private String status;
    private String hostUsername;
    private List<String> hashtags;
    private LocalDateTime createdAt;

    public DebateRoomResponse() {
    }

    public DebateRoomResponse(String roomId, String title, String description, String visibility, String status,
            String hostUsername, List<String> hashtags, LocalDateTime createdAt) {
        this.roomId = roomId;
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.status = status;
        this.hostUsername = hostUsername;
        this.hashtags = hashtags;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHostUsername() {
        return hostUsername;
    }

    public void setHostUsername(String hostUsername) {
        this.hostUsername = hostUsername;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public void setHashtags(List<String> hashtags) {
        this.hashtags = hashtags;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
