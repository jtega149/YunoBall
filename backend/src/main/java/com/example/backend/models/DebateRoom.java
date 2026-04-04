package com.example.backend.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "debate_rooms")
public class DebateRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, unique = true, length = 64)
    private String roomId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_id", nullable = false)
    private Users host;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DebateVisibility visibility = DebateVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DebateRoomStatus status = DebateRoomStatus.ACTIVE;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "debate_room_hashtags", joinColumns = @JoinColumn(name = "debate_room_id"))
    @Column(name = "hashtag", length = 120)
    private List<String> hashtags = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected DebateRoom() {
    }

    public DebateRoom(String roomId, Users host, String title, String description, DebateVisibility visibility,
            List<String> hashtags) {
        this.roomId = roomId;
        this.host = host;
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        if (hashtags != null) {
            this.hashtags = new ArrayList<>(hashtags);
        }
    }

    public Long getId() {
        return id;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public Users getHost() {
        return host;
    }

    public void setHost(Users host) {
        this.host = host;
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

    public DebateVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(DebateVisibility visibility) {
        this.visibility = visibility;
    }

    public DebateRoomStatus getStatus() {
        return status;
    }

    public void setStatus(DebateRoomStatus status) {
        this.status = status;
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
}
