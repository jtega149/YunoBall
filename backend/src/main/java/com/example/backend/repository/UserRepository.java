package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.models.Users;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);

    Optional<Users> findByUsername(String username);

    List<Users> findTop10ByOrderByWinsDescLossesAsc();

    @Query("SELECT COUNT(u) FROM Users u WHERE u.wins > :w OR (u.wins = :w AND u.losses < :losses)")
    long countRankingAhead(@Param("w") int wins, @Param("losses") int losses);
}
