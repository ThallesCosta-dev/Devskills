package com.devskills.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

@Entity
@Table(name = "developer")
public class Developer {

    @Id
    private String id; // UUID from Supabase

    @Column(unique = true)
    private String username;
    private String name;
    private String email;
    @Column(length = 1000)
    private String bio;
    
    private String avatarUrl;
    private String location;
    private String role;
    private String github;
    private String linkedin;
    private String portfolio;

    // Constructors
    public Developer() {}

    public Developer(String id, String name, String email, String bio) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.bio = bio;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getPortfolio() { return portfolio; }
    public void setPortfolio(String portfolio) { this.portfolio = portfolio; }
}
