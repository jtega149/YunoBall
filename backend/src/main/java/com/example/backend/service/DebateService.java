package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.backend.dto.CreateDebateRequest;
import com.example.backend.dto.DebateHistoryItemResponse;
import com.example.backend.dto.DebateRoomResponse;
import com.example.backend.dto.LeaderboardResponse;
import com.example.backend.models.DebateHistory;
import com.example.backend.models.DebateRoom;
import com.example.backend.models.DebateRoomStatus;
import com.example.backend.models.DebateVisibility;
import com.example.backend.models.Users;
import com.example.backend.repository.DebateHistoryRepository;
import com.example.backend.repository.DebateRoomRepository;
import com.example.backend.repository.UserRepository;

@Service
public class DebateService {

    private final DebateRoomRepository debateRoomRepository;
    private final DebateHistoryRepository debateHistoryRepository;
    private final UserRepository userRepository;

    public DebateService(DebateRoomRepository debateRoomRepository, DebateHistoryRepository debateHistoryRepository,
            UserRepository userRepository) {
        this.debateRoomRepository = debateRoomRepository;
        this.debateHistoryRepository = debateHistoryRepository;
        this.userRepository = userRepository;
    }

    public static String newRoomId() {
        return "DBT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    @Transactional
    public DebateRoomResponse create(String hostEmail, CreateDebateRequest req) {
        Users host = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        DebateVisibility vis = parseVisibility(req.getVisibility());
        List<String> tags = normalizeHashtags(req.getHashtags());
        String roomId = newRoomId();
        DebateRoom room = new DebateRoom(roomId, host, req.getTitle().trim(), req.getDescription().trim(), vis, tags);
        debateRoomRepository.save(room);
        return toResponse(room);
    }

    public DebateRoomResponse getByRoomId(String roomId) {
        DebateRoom room = debateRoomRepository.findByRoomId(roomId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Debate not found"));
        return toResponse(room);
    }

    public void assertCanJoin(String roomId, Optional<String> requesterEmail) {
        DebateRoom room = debateRoomRepository.findByRoomId(roomId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Debate not found"));
        if (room.getStatus() != DebateRoomStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.GONE, "Debate has ended");
        }
        if (room.getVisibility() == DebateVisibility.PRIVATE) {
            // Private debates: only users who know room ID may join; no extra check here
            return;
        }
    }

    public List<DebateRoomResponse> searchPublic(String q) {
        if (q == null || q.isBlank()) {
            return recommended();
        }
        String term = q.trim();
        List<DebateRoom> list = debateRoomRepository.searchPublicActive(term, DebateVisibility.PUBLIC,
                DebateRoomStatus.ACTIVE);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<DebateRoomResponse> recommended() {
        return debateRoomRepository
                .findTop10ByVisibilityAndStatusOrderByCreatedAtDesc(DebateVisibility.PUBLIC, DebateRoomStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DebateHistoryItemResponse> historyForUser(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        List<DebateHistory> rows = debateHistoryRepository.findByParticipantOrderByDesc(user);
        List<DebateHistoryItemResponse> out = new ArrayList<>();
        for (DebateHistory h : rows) {
            DebateHistoryItemResponse item = new DebateHistoryItemResponse();
            item.setId(h.getId());
            item.setRoomId(h.getRoomId());
            item.setTitle(h.getTitle());
            item.setDebateEndedAt(h.getDebateEndedAt());
            item.setWinnerUsername(h.getWinner().getUsername());
            item.setHostUsername(h.getHost().getUsername());
            item.setGuestUsername(h.getGuest().getUsername());
            boolean amHost = h.getHost().getId() == user.getId();
            boolean amGuest = h.getGuest().getId() == user.getId();
            if (amHost) {
                item.setMyRole("HOST");
                item.setMyResult(h.getWinner().getId() == user.getId() ? "WIN" : "LOSS");
            } else if (amGuest) {
                item.setMyRole("GUEST");
                item.setMyResult(h.getWinner().getId() == user.getId() ? "WIN" : "LOSS");
            } else {
                item.setMyRole("VIEWER");
                item.setMyResult("N/A");
            }
            out.add(item);
        }
        return out;
    }

    public LeaderboardResponse leaderboard(String email) {
        List<Users> top = userRepository.findTop10ByOrderByWinsDescLossesAsc();
        List<LeaderboardResponse.LeaderboardRow> rows = new ArrayList<>();
        int rank = 1;
        for (Users u : top) {
            rows.add(row(rank++, u));
        }
        Users me = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        LeaderboardResponse.LeaderboardRow meRow = row(0, me);
        long ahead = userRepository.countRankingAhead(me.getWins(), me.getLosses());
        meRow.setRank((int) ahead + 1);
        return new LeaderboardResponse(rows, meRow);
    }

    private LeaderboardResponse.LeaderboardRow row(int rank, Users u) {
        int total = u.getWins() + u.getLosses();
        double rate = total == 0 ? 0.0 : (100.0 * u.getWins() / total);
        return new LeaderboardResponse.LeaderboardRow(rank, u.getUsername(), u.getWins(), u.getLosses(),
                u.getTotalDebates(), Math.round(rate * 10.0) / 10.0);
    }

    @Transactional
    public void completeDebate(String roomId, String winnerUsername, String guestUsername) {
        DebateRoom room = debateRoomRepository.findByRoomId(roomId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Debate not found"));
        if (room.getStatus() != DebateRoomStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Debate already ended");
        }
        Users host = room.getHost();
        Users guest = userRepository.findByUsername(guestUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest not found"));
        Users winner = userRepository.findByUsername(winnerUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Winner not found"));
        if (winner.getId() != host.getId() && winner.getId() != guest.getId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Winner must be host or guest");
        }
        Users loser = winner.getId() == host.getId() ? guest : host;

        winner.setWins(winner.getWins() + 1);
        loser.setLosses(loser.getLosses() + 1);
        winner.setTotalDebates(winner.getTotalDebates() + 1);
        loser.setTotalDebates(loser.getTotalDebates() + 1);
        userRepository.save(winner);
        userRepository.save(loser);

        DebateHistory history = new DebateHistory(room.getRoomId(), room.getTitle(), host, guest, winner,
                LocalDateTime.now());
        debateHistoryRepository.save(history);

        room.setStatus(DebateRoomStatus.ENDED);
        debateRoomRepository.save(room);
    }

    /** Ends the room without debate history (host left early, or explicit end before poll). */
    @Transactional
    public void markRoomEndedWithoutDebate(String roomId) {
        DebateRoom room = debateRoomRepository.findByRoomId(roomId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Debate not found"));
        if (room.getStatus() == DebateRoomStatus.ENDED) {
            return;
        }
        room.setStatus(DebateRoomStatus.ENDED);
        debateRoomRepository.save(room);
    }

    @Transactional
    public void endRoomAsHostByEmail(String roomId, String hostEmail) {
        Users u = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        DebateRoom room = debateRoomRepository.findByRoomId(roomId.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Debate not found"));
        if (room.getHost().getId() != u.getId()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can end this debate");
        }
        markRoomEndedWithoutDebate(roomId);
    }

    private DebateRoomResponse toResponse(DebateRoom room) {
        return new DebateRoomResponse(room.getRoomId(), room.getTitle(), room.getDescription(),
                room.getVisibility().name(), room.getStatus().name(), room.getHost().getUsername(),
                new ArrayList<>(room.getHashtags()), room.getCreatedAt());
    }

    private static DebateVisibility parseVisibility(String v) {
        if (v == null) {
            return DebateVisibility.PUBLIC;
        }
        try {
            return DebateVisibility.valueOf(v.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return DebateVisibility.PUBLIC;
        }
    }

    private static List<String> normalizeHashtags(List<String> raw) {
        if (raw == null) {
            return new ArrayList<>();
        }
        List<String> out = new ArrayList<>();
        for (String s : raw) {
            if (s == null) {
                continue;
            }
            String t = s.trim();
            if (t.isEmpty()) {
                continue;
            }
            if (!t.startsWith("#")) {
                t = "#" + t;
            }
            out.add(t.toLowerCase());
            if (out.size() >= 10) {
                break;
            }
        }
        return out;
    }
}
