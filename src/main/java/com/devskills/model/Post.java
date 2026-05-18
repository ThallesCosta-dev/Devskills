package com.devskills.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "post")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private Developer author;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "shared_from_id")
    private Post sharedFrom;

    @Column(name = "post_type")
    private String postType; // GENERAL, JOB_POSTING, ACHIEVEMENT

    public Post() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Developer getAuthor() { return author; }
    public void setAuthor(Developer author) { this.author = author; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Post getSharedFrom() { return sharedFrom; }
    public void setSharedFrom(Post sharedFrom) { this.sharedFrom = sharedFrom; }

    public String getPostType() { return postType; }
    public void setPostType(String postType) { this.postType = postType; }
}
