package com.example.backend.security;

import java.util.Collection;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.example.backend.models.Role;
import com.example.backend.models.Users;
import com.example.backend.repository.UserRepository;

import java.util.stream.Collectors;

/*
    This entire files purpose is to basically fetch user details from the database
    and pack it up into a UserDetails object that Spring Security uses for authentication
 */

@Service
public class CustomUserDetailsService implements UserDetailsService {
    public UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override // called by Spring Security to load user details during authentication
    public UserDetails loadUserByUsername(String email) {
        Users user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return new User(user.getEmail(), user.getPassword(), mapRolesToAuthorities(user.getRoles()));
        // User signature: User(String username, String password, Collection<? extends GrantedAuthority> authorities)
    }
    
    private Collection<GrantedAuthority> mapRolesToAuthorities(Set<Role> roles) {
        return roles.stream().map(role -> new SimpleGrantedAuthority(role.getName().name())).collect(Collectors.toList());
    }
}
