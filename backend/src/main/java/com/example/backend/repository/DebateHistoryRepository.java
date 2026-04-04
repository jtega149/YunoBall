package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.models.DebateHistory;
import com.example.backend.models.Users;

public interface DebateHistoryRepository extends JpaRepository<DebateHistory, Long> {

    @Query("SELECT h FROM DebateHistory h WHERE h.host = :user OR h.guest = :user ORDER BY h.debateEndedAt DESC")
    List<DebateHistory> findByParticipantOrderByDesc(@Param("user") Users user);
}
