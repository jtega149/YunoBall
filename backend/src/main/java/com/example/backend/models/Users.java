package com.example.backend.models;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class) // Updates things like updatedAt automatically
public class Users {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;

    @ManyToMany(fetch = FetchType.EAGER) // LAZY means roles only loaded when accessed, EAGER means roles loaded immediately with user
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** Defaults help Hibernate generate ADD COLUMN ... DEFAULT 0 so existing rows stay valid in PostgreSQL. */
    @ColumnDefault("0")
    @Column(nullable = false)
    private int wins = 0;

    @ColumnDefault("0")
    @Column(nullable = false)
    private int losses = 0;

    @ColumnDefault("0")
    @Column(name = "total_debates", nullable = false)
    private int totalDebates = 0;

    @CreationTimestamp
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @UpdateTimestamp
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public long getId(){
        return id;
    }

    public String getUsername(){
        return username;
    }
    public void setUsername(String username){
        this.username = username;
    }

    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email = email;
    }

    public String getPassword(){
        return password;
    }
    public void setPassword(String password){
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }
    public void setRoles(Set<Role> roles) {
        this.roles = roles;
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

    public String toString() {
        return "Users email: " + this.email + "\nUsers username: " + this.username + "\n";
    }

    protected Users() {} // Default constructor needed per JPA requirments

    public Users(String username, String password, String email){
        this.username = username;
        this.password = password;
        this.email = email.toLowerCase();
    }
}
