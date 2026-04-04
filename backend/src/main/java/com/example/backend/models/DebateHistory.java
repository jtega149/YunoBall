package com.example.backend.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "debate_history")
public class DebateHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false, length = 64)
    private String roomId;

    @Column(nullable = false, length = 500)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_id", nullable = false)
    private Users host;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guest_id", nullable = false)
    private Users guest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "winner_id", nullable = false)
    private Users winner;

    @Column(name = "debate_ended_at", nullable = false)
    private LocalDateTime debateEndedAt;

    protected DebateHistory() {
    }

    public DebateHistory(String roomId, String title, Users host, Users guest, Users winner, LocalDateTime debateEndedAt) {
        this.roomId = roomId;
        this.title = title;
        this.host = host;
        this.guest = guest;
        this.winner = winner;
        this.debateEndedAt = debateEndedAt;
    }

    public Long getId() {
        return id;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getTitle() {
        return title;
    }

    public Users getHost() {
        return host;
    }

    public Users getGuest() {
        return guest;
    }

    public Users getWinner() {
        return winner;
    }

    public LocalDateTime getDebateEndedAt() {
        return debateEndedAt;
    }
}
