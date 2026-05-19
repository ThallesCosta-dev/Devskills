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

    private String title;
    
    private String subreddit; // e.g. "Geral", "Dúvidas", "Vagas"
    
    private int upvotes = 0;
    
    private int downvotes = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "shared_from_id")
    private Post sharedFrom;

    @Column(name = "post_type")
    private String postType; // GENERAL, JOB_POSTING, ACHIEVEMENT
    
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PostVote> votes = new java.util.ArrayList<>();

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
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSubreddit() { return subreddit; }
    public void setSubreddit(String subreddit) { this.subreddit = subreddit; }
    
    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
    
    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Post getSharedFrom() { return sharedFrom; }
    public void setSharedFrom(Post sharedFrom) { this.sharedFrom = sharedFrom; }

    public String getPostType() { return postType; }
    public void setPostType(String postType) { this.postType = postType; }
    
    public java.util.List<PostVote> getVotes() { return votes; }
    public void setVotes(java.util.List<PostVote> votes) { this.votes = votes; }
}
