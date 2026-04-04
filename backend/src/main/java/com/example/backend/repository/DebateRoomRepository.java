package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.models.DebateRoom;
import com.example.backend.models.DebateRoomStatus;
import com.example.backend.models.DebateVisibility;

public interface DebateRoomRepository extends JpaRepository<DebateRoom, Long> {

    Optional<DebateRoom> findByRoomId(String roomId);

    List<DebateRoom> findTop10ByVisibilityAndStatusOrderByCreatedAtDesc(
            DebateVisibility visibility, DebateRoomStatus status);

    @Query("SELECT DISTINCT d FROM DebateRoom d LEFT JOIN d.hashtags h WHERE d.visibility = :vis AND d.status = :st "
            + "AND (LOWER(d.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(h) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<DebateRoom> searchPublicActive(@Param("q") String q, @Param("vis") DebateVisibility visibility,
            @Param("st") DebateRoomStatus status);
}
