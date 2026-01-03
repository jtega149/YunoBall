package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Users;

public interface UserRepository extends JpaRepository<Users, Long>{
    Optional<Users> findByEmail(String email); // Returns user is .isPresent(), can get obj with .get()
    // or better ex: User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    Optional<Users> findByUsername(String username);
    //Optional<User> findByEmailOrUsername(String email, String username);
    
}
