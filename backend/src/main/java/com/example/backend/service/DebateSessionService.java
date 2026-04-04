package com.example.backend.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.backend.dto.DebateClientEvent;
import com.example.backend.dto.DebateStateSnapshot;
import com.example.backend.models.DebateRoom;
import com.example.backend.models.DebateRoomStatus;
import com.example.backend.repository.DebateRoomRepository;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class DebateSessionService {

    private static final long POLL_MS = 60_000;

    private final DebateRoomRepository debateRoomRepository;
    private final DebateService debateService;
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, RoomRuntime> rooms = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(8);

    public DebateSessionService(DebateRoomRepository debateRoomRepository, DebateService debateService,
            SimpMessagingTemplate messagingTemplate) {
        this.debateRoomRepository = debateRoomRepository;
        this.debateService = debateService;
        this.messagingTemplate = messagingTemplate;
    }

    public void handleEvent(String roomId, DebateClientEvent ev) {
        if (ev == null || ev.getType() == null || ev.getUsername() == null) {
            return;
        }
        String type = ev.getType().trim().toUpperCase();
        String user = ev.getUsername().trim();
        RoomRuntime r = getOrCreate(roomId);
        synchronized (r) {
            switch (type) {
                case "JOIN" -> join(r, user);
                case "LEAVE" -> leave(r, user);
                case "END_ROOM" -> endRoomByHost(r, user);
                case "REQUEST_GUEST" -> requestGuest(r, user);
                case "ACCEPT_GUEST" -> acceptGuest(r, user, ev.getTargetUsername());
                case "DECLINE_GUEST" -> declineGuestRequest(r, user, ev.getTargetUsername());
                case "KICK" -> kick(r, user, ev.getTargetUsername());
                case "BAN" -> ban(r, user, ev.getTargetUsername());
                case "CONFIGURE_ROUNDS" -> configureRounds(r, user, ev.getPayload());
                case "START_DEBATE" -> startDebate(r, user);
                case "MEDIA_UPDATE" -> mediaUpdate(r, user, ev.getPayload());
                case "POLL_VOTE" -> pollVote(r, user, ev.getPayload());
                case "WEBRTC_SIGNAL" -> relayWebRtc(roomId, ev);
                default -> {
                    /* ignore */
                }
            }
            broadcast(r);
        }
    }

    private RoomRuntime getOrCreate(String roomId) {
        return rooms.computeIfAbsent(roomId, id -> {
            DebateRoom dr = debateRoomRepository.findByRoomId(id)
                    .orElseThrow(() -> new IllegalArgumentException("Unknown room"));
            RoomRuntime r = new RoomRuntime();
            r.roomId = id;
            r.hostUsername = dr.getHost().getUsername();
            r.phase = dr.getStatus() == DebateRoomStatus.ENDED ? "ENDED" : "IDLE";
            return r;
        });
    }

    private void join(RoomRuntime r, String user) {
        DebateRoom dr = debateRoomRepository.findByRoomId(r.roomId).orElse(null);
        if (dr == null || dr.getStatus() != DebateRoomStatus.ACTIVE) {
            r.lastError = "This debate has ended or is not available.";
            return;
        }
        if (r.banned.contains(user)) {
            r.lastError = "You are banned from this room.";
            return;
        }
        r.lastError = null;
        r.viewers.add(user);
    }

    private void leave(RoomRuntime r, String user) {
        if (user.equals(r.hostUsername)) {
            shutdownRoomAsHostLeft(r);
            return;
        }
        r.viewers.remove(user);
        r.pendingGuestRequests.remove(user);
        if (user.equals(r.guestUsername)) {
            cancelTimer(r);
            r.guestUsername = null;
            r.phase = "IDLE";
        }
    }

    /** Host clicked Leave or explicitly ended the room — persist ENDED and notify clients. */
    private void endRoomByHost(RoomRuntime r, String actor) {
        if (!actor.equals(r.hostUsername)) {
            return;
        }
        shutdownRoomAsHostLeft(r);
    }

    private void shutdownRoomAsHostLeft(RoomRuntime r) {
        cancelTimer(r);
        r.guestUsername = null;
        r.pendingGuestRequests.clear();
        r.phase = "ENDED";
        try {
            debateService.markRoomEndedWithoutDebate(r.roomId);
        } catch (Exception e) {
            r.lastError = e.getMessage();
        }
        broadcast(r);
        rooms.remove(r.roomId);
    }

    /** Called from REST after host ends room, to sync in-memory state if JVM still has old session. */
    public void notifyRoomClosedFromRest(String roomId) {
        RoomRuntime r = rooms.get(roomId);
        if (r == null) {
            return;
        }
        synchronized (r) {
            cancelTimer(r);
            r.guestUsername = null;
            r.pendingGuestRequests.clear();
            r.phase = "ENDED";
            broadcast(r);
        }
        rooms.remove(roomId);
    }

    private void requestGuest(RoomRuntime r, String user) {
        if (user.equals(r.hostUsername)) {
            return;
        }
        if (!r.viewers.contains(user)) {
            r.viewers.add(user);
        }
        if (r.guestUsername != null) {
            r.lastError = "A guest debater is already active.";
            return;
        }
        r.pendingGuestRequests.add(user);
        r.lastError = null;
    }

    private void declineGuestRequest(RoomRuntime r, String actor, String target) {
        if (!actor.equals(r.hostUsername) || target == null || target.isBlank()) {
            return;
        }
        r.pendingGuestRequests.remove(target.trim());
        r.lastError = null;
    }

    private void acceptGuest(RoomRuntime r, String actor, String target) {
        if (!actor.equals(r.hostUsername)) {
            return;
        }
        if (target == null || target.isBlank()) {
            return;
        }
        if (r.guestUsername != null) {
            return;
        }
        String t = target.trim();
        if (!r.pendingGuestRequests.contains(t)) {
            return;
        }
        r.viewers.add(t);
        r.guestUsername = t;
        r.pendingGuestRequests.clear();
        r.lastError = null;
    }

    private void kick(RoomRuntime r, String actor, String target) {
        if (!actor.equals(r.hostUsername) || target == null) {
            return;
        }
        String t = target.trim();
        if (t.equals(r.guestUsername)) {
            cancelTimer(r);
            r.guestUsername = null;
            r.phase = "IDLE";
        }
        r.viewers.remove(t);
        r.pendingGuestRequests.remove(t);
    }

    private void ban(RoomRuntime r, String actor, String target) {
        if (!actor.equals(r.hostUsername) || target == null) {
            return;
        }
        String t = target.trim();
        r.banned.add(t);
        kick(r, actor, t);
    }

    private void configureRounds(RoomRuntime r, String actor, JsonNode payload) {
        if (!actor.equals(r.hostUsername) || payload == null || !payload.has("rounds")) {
            return;
        }
        List<DebateStateSnapshot.RoundDto> list = new ArrayList<>();
        for (JsonNode n : payload.get("rounds")) {
            String name = n.has("name") ? n.get("name").asText() : "Round";
            int s12 = n.has("segment12Minutes") ? n.get("segment12Minutes").asInt(5) : 5;
            int s3 = n.has("segment3Minutes") ? n.get("segment3Minutes").asInt(5) : 5;
            if (s12 < 1) {
                s12 = 1;
            }
            if (s3 < 1) {
                s3 = 1;
            }
            list.add(new DebateStateSnapshot.RoundDto(name, s12, s3));
        }
        r.rounds = list;
        r.lastError = null;
    }

    private void startDebate(RoomRuntime r, String actor) {
        if (!actor.equals(r.hostUsername)) {
            return;
        }
        DebateRoom dr = debateRoomRepository.findByRoomId(r.roomId).orElse(null);
        if (dr == null || dr.getStatus() != DebateRoomStatus.ACTIVE) {
            r.lastError = "This debate has ended or is unavailable.";
            return;
        }
        if (r.guestUsername == null || r.rounds.isEmpty()) {
            r.lastError = "Need a guest debater and at least one configured round.";
            return;
        }
        cancelTimer(r);
        r.phase = "LIVE";
        r.currentRoundIndex = 0;
        r.currentSegment = 1;
        r.pollVotesHost = 0;
        r.pollVotesGuest = 0;
        r.pollVoters.clear();
        applyMuteForSegment(r);
        scheduleCurrentSegment(r);
        r.lastError = null;
    }

    private void mediaUpdate(RoomRuntime r, String user, JsonNode payload) {
        if (payload == null) {
            return;
        }
        boolean cam = payload.has("camOn") && payload.get("camOn").asBoolean(true);
        boolean scr = payload.has("screenOn") && payload.get("screenOn").asBoolean(false);
        if (user.equals(r.hostUsername)) {
            r.hostCamOn = cam;
            r.hostScreenOn = scr;
        } else if (user.equals(r.guestUsername)) {
            r.guestCamOn = cam;
            r.guestScreenOn = scr;
        }
    }

    private void pollVote(RoomRuntime r, String user, JsonNode payload) {
        if (!"POLL".equals(r.phase) || payload == null || !payload.has("choice")) {
            return;
        }
        if (user.equals(r.hostUsername) || user.equals(r.guestUsername)) {
            return;
        }
        if (!r.viewers.contains(user)) {
            r.viewers.add(user);
        }
        if (r.pollVoters.contains(user)) {
            return;
        }
        String choice = payload.get("choice").asText("").toUpperCase();
        r.pollVoters.add(user);
        if ("HOST".equals(choice)) {
            r.pollVotesHost++;
        } else if ("GUEST".equals(choice)) {
            r.pollVotesGuest++;
        }
    }

    private void relayWebRtc(String roomId, DebateClientEvent ev) {
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/webrtc", ev);
    }

    private void scheduleCurrentSegment(RoomRuntime r) {
        cancelTimer(r);
        if (!"LIVE".equals(r.phase) || r.currentRoundIndex >= r.rounds.size()) {
            return;
        }
        DebateStateSnapshot.RoundDto round = r.rounds.get(r.currentRoundIndex);
        long minutes = r.currentSegment <= 2 ? round.segment12Minutes : round.segment3Minutes;
        long ms = Math.max(1, minutes) * 60_000;
        r.segmentEndsAtMs = Long.valueOf(System.currentTimeMillis() + ms);
        r.timer = scheduler.schedule(() -> advanceAfterSegment(r.roomId), ms, TimeUnit.MILLISECONDS);
    }

    private void advanceAfterSegment(String roomId) {
        RoomRuntime r = rooms.get(roomId);
        if (r == null) {
            return;
        }
        synchronized (r) {
            if (!"LIVE".equals(r.phase)) {
                return;
            }
            if (r.currentSegment < 3) {
                r.currentSegment++;
                applyMuteForSegment(r);
                scheduleCurrentSegment(r);
            } else if (r.currentRoundIndex < r.rounds.size() - 1) {
                r.currentRoundIndex++;
                r.currentSegment = 1;
                applyMuteForSegment(r);
                scheduleCurrentSegment(r);
            } else {
                startPollPhase(r);
            }
            broadcast(r);
        }
    }

    private void startPollPhase(RoomRuntime r) {
        cancelTimer(r);
        r.phase = "POLL";
        r.pollEndsAtMs = Long.valueOf(System.currentTimeMillis() + POLL_MS);
        r.pollVotesHost = 0;
        r.pollVotesGuest = 0;
        r.pollVoters.clear();
        r.segmentEndsAtMs = null;
        r.timer = scheduler.schedule(() -> finishPoll(r.roomId), POLL_MS, TimeUnit.MILLISECONDS);
    }

    private void finishPoll(String roomId) {
        RoomRuntime r = rooms.get(roomId);
        if (r == null) {
            return;
        }
        synchronized (r) {
            if (!"POLL".equals(r.phase)) {
                return;
            }
            String guestName = r.guestUsername;
            String winner;
            if (r.pollVotesGuest > r.pollVotesHost) {
                winner = guestName;
            } else {
                winner = r.hostUsername;
            }
            r.pollWinnerUsername = winner;
            r.debateWinnerUsername = winner;
            r.phase = "FINISHED";
            try {
                if (guestName != null) {
                    debateService.completeDebate(r.roomId, winner, guestName);
                }
            } catch (Exception e) {
                r.lastError = e.getMessage();
            }
            r.guestUsername = null;
            cancelTimer(r);
            broadcast(r);
            rooms.remove(roomId);
        }
    }

    private void applyMuteForSegment(RoomRuntime r) {
        if (r.currentSegment == 1) {
            r.hostMuted = false;
            r.guestMuted = true;
        } else if (r.currentSegment == 2) {
            r.hostMuted = true;
            r.guestMuted = false;
        } else {
            r.hostMuted = false;
            r.guestMuted = false;
        }
    }

    private void cancelTimer(RoomRuntime r) {
        if (r.timer != null) {
            r.timer.cancel(false);
            r.timer = null;
        }
        r.segmentEndsAtMs = null;
        r.pollEndsAtMs = null;
    }

    private void broadcast(RoomRuntime r) {
        DebateStateSnapshot s = new DebateStateSnapshot();
        s.setPhase(r.phase);
        s.setRoomId(r.roomId);
        s.setHostUsername(r.hostUsername);
        s.setGuestUsername(r.guestUsername);
        s.setViewers(new HashSet<>(r.viewers));
        s.setBannedUsernames(new HashSet<>(r.banned));
        s.setPendingGuestRequestUsernames(new ArrayList<>(r.pendingGuestRequests));
        s.setCurrentRoundIndex(r.currentRoundIndex);
        s.setCurrentSegment(r.currentSegment);
        s.setRounds(new ArrayList<>(r.rounds));
        s.setSegmentEndsAtEpochMs(r.segmentEndsAtMs);
        s.setPollEndsAtEpochMs(r.pollEndsAtMs);
        s.setPollVotesHost(r.pollVotesHost);
        s.setPollVotesGuest(r.pollVotesGuest);
        s.setPollWinnerUsername(r.pollWinnerUsername);
        s.setDebateWinnerUsername(r.debateWinnerUsername);
        s.setHostMuted(r.hostMuted);
        s.setGuestMuted(r.guestMuted);
        s.setHostCamOn(r.hostCamOn);
        s.setHostScreenOn(r.hostScreenOn);
        s.setGuestCamOn(r.guestCamOn);
        s.setGuestScreenOn(r.guestScreenOn);
        s.setError(r.lastError);
        r.lastError = null;
        messagingTemplate.convertAndSend("/topic/room/" + r.roomId + "/debate", s);
    }

    /** Used when a room is first opened on the server so clients get initial state. */
    public void ensureSession(String roomId) {
        RoomRuntime r = getOrCreate(roomId);
        synchronized (r) {
            broadcast(r);
        }
    }

    private static final class RoomRuntime {
        String roomId;
        String hostUsername;
        String guestUsername;
        final Set<String> viewers = new HashSet<>();
        final Set<String> banned = new HashSet<>();
        final Set<String> pollVoters = new HashSet<>();
        final Set<String> pendingGuestRequests = new LinkedHashSet<>();
        String phase = "IDLE";
        List<DebateStateSnapshot.RoundDto> rounds = new ArrayList<>();
        int currentRoundIndex;
        int currentSegment = 1;
        Long segmentEndsAtMs;
        Long pollEndsAtMs;
        int pollVotesHost;
        int pollVotesGuest;
        String pollWinnerUsername;
        String debateWinnerUsername;
        boolean hostMuted;
        boolean guestMuted;
        boolean hostCamOn = true;
        boolean hostScreenOn;
        boolean guestCamOn = true;
        boolean guestScreenOn;
        String lastError;
        ScheduledFuture<?> timer;
    }
}
