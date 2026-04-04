package com.example.backend.dto;

import java.util.List;

public class LeaderboardResponse {
    private List<LeaderboardRow> top;
    private LeaderboardRow me;

    public LeaderboardResponse() {
    }

    public LeaderboardResponse(List<LeaderboardRow> top, LeaderboardRow me) {
        this.top = top;
        this.me = me;
    }

    public List<LeaderboardRow> getTop() {
        return top;
    }

    public void setTop(List<LeaderboardRow> top) {
        this.top = top;
    }

    public LeaderboardRow getMe() {
        return me;
    }

    public void setMe(LeaderboardRow me) {
        this.me = me;
    }

    public static class LeaderboardRow {
        private int rank;
        private String username;
        private int wins;
        private int losses;
        private int totalDebates;
        private double winRate;

        public LeaderboardRow() {
        }

        public LeaderboardRow(int rank, String username, int wins, int losses, int totalDebates, double winRate) {
            this.rank = rank;
            this.username = username;
            this.wins = wins;
            this.losses = losses;
            this.totalDebates = totalDebates;
            this.winRate = winRate;
        }

        public int getRank() {
            return rank;
        }

        public void setRank(int rank) {
            this.rank = rank;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public int getWins() {
            return wins;
        }

        public void setWins(int wins) {
            this.wins = wins;
        }

        public int getLosses() {
            return losses;
        }

        public void setLosses(int losses) {
            this.losses = losses;
        }

        public int getTotalDebates() {
            return totalDebates;
        }

        public void setTotalDebates(int totalDebates) {
            this.totalDebates = totalDebates;
        }

        public double getWinRate() {
            return winRate;
        }

        public void setWinRate(double winRate) {
            this.winRate = winRate;
        }
    }
}
