package com.example.backend.dto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DebateStateSnapshot {
    private String phase;
    private String roomId;
    private String hostUsername;
    private String guestUsername;
    private Set<String> viewers = new HashSet<>();
    private Set<String> bannedUsernames = new HashSet<>();
    private List<String> pendingGuestRequestUsernames = new ArrayList<>();

    private int currentRoundIndex;
    private int currentSegment;
    private List<RoundDto> rounds = new ArrayList<>();
    private Long segmentEndsAtEpochMs;
    private Long pollEndsAtEpochMs;
    private int pollVotesHost;
    private int pollVotesGuest;
    private String pollWinnerUsername;
    private String debateWinnerUsername;

    private boolean hostMuted;
    private boolean guestMuted;

    private boolean hostCamOn = true;
    private boolean hostScreenOn;
    private boolean guestCamOn = true;
    private boolean guestScreenOn;

    private String error;

    public static class RoundDto {
        public String name;
        public int segment12Minutes;
        public int segment3Minutes;

        public RoundDto() {
        }

        public RoundDto(String name, int segment12Minutes, int segment3Minutes) {
            this.name = name;
            this.segment12Minutes = segment12Minutes;
            this.segment3Minutes = segment3Minutes;
        }
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
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

    public Set<String> getViewers() {
        return viewers;
    }

    public void setViewers(Set<String> viewers) {
        this.viewers = viewers;
    }

    public Set<String> getBannedUsernames() {
        return bannedUsernames;
    }

    public void setBannedUsernames(Set<String> bannedUsernames) {
        this.bannedUsernames = bannedUsernames;
    }

    public List<String> getPendingGuestRequestUsernames() {
        return pendingGuestRequestUsernames;
    }

    public void setPendingGuestRequestUsernames(List<String> pendingGuestRequestUsernames) {
        this.pendingGuestRequestUsernames = pendingGuestRequestUsernames != null ? pendingGuestRequestUsernames : new ArrayList<>();
    }

    public int getCurrentRoundIndex() {
        return currentRoundIndex;
    }

    public void setCurrentRoundIndex(int currentRoundIndex) {
        this.currentRoundIndex = currentRoundIndex;
    }

    public int getCurrentSegment() {
        return currentSegment;
    }

    public void setCurrentSegment(int currentSegment) {
        this.currentSegment = currentSegment;
    }

    public List<RoundDto> getRounds() {
        return rounds;
    }

    public void setRounds(List<RoundDto> rounds) {
        this.rounds = rounds;
    }

    public Long getSegmentEndsAtEpochMs() {
        return segmentEndsAtEpochMs;
    }

    public void setSegmentEndsAtEpochMs(Long segmentEndsAtEpochMs) {
        this.segmentEndsAtEpochMs = segmentEndsAtEpochMs;
    }

    public Long getPollEndsAtEpochMs() {
        return pollEndsAtEpochMs;
    }

    public void setPollEndsAtEpochMs(Long pollEndsAtEpochMs) {
        this.pollEndsAtEpochMs = pollEndsAtEpochMs;
    }

    public int getPollVotesHost() {
        return pollVotesHost;
    }

    public void setPollVotesHost(int pollVotesHost) {
        this.pollVotesHost = pollVotesHost;
    }

    public int getPollVotesGuest() {
        return pollVotesGuest;
    }

    public void setPollVotesGuest(int pollVotesGuest) {
        this.pollVotesGuest = pollVotesGuest;
    }

    public String getPollWinnerUsername() {
        return pollWinnerUsername;
    }

    public void setPollWinnerUsername(String pollWinnerUsername) {
        this.pollWinnerUsername = pollWinnerUsername;
    }

    public String getDebateWinnerUsername() {
        return debateWinnerUsername;
    }

    public void setDebateWinnerUsername(String debateWinnerUsername) {
        this.debateWinnerUsername = debateWinnerUsername;
    }

    public boolean isHostMuted() {
        return hostMuted;
    }

    public void setHostMuted(boolean hostMuted) {
        this.hostMuted = hostMuted;
    }

    public boolean isGuestMuted() {
        return guestMuted;
    }

    public void setGuestMuted(boolean guestMuted) {
        this.guestMuted = guestMuted;
    }

    public boolean isHostCamOn() {
        return hostCamOn;
    }

    public void setHostCamOn(boolean hostCamOn) {
        this.hostCamOn = hostCamOn;
    }

    public boolean isHostScreenOn() {
        return hostScreenOn;
    }

    public void setHostScreenOn(boolean hostScreenOn) {
        this.hostScreenOn = hostScreenOn;
    }

    public boolean isGuestCamOn() {
        return guestCamOn;
    }

    public void setGuestCamOn(boolean guestCamOn) {
        this.guestCamOn = guestCamOn;
    }

    public boolean isGuestScreenOn() {
        return guestScreenOn;
    }

    public void setGuestScreenOn(boolean guestScreenOn) {
        this.guestScreenOn = guestScreenOn;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
