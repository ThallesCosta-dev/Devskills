package com.devskills.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_offer")
public class JobOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(length = 2000)
    private String description;

    @Column(name = "source_url")
    private String sourceUrl;

    @Column(name = "source_platform")
    private String sourcePlatform; // LinkedIn, RemoteOK, Arbeitnow, etc.

    private String location;    // "Remote", "São Paulo, BR", etc.
    private String salaryRange; // "R$8k–R$15k" ou null
    private String tags;        // "React,TypeScript,Node.js" (CSV)
    private String jobType;     // "REMOTE", "HYBRID", "ONSITE"

    @Column(name = "external_id", unique = true)
    private String externalId;  // ID externo único para evitar duplicatas

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"skills", "bio", "email", "github", "linkedin", "portfolio", "location", "role", "username", "hibernateLazyInitializer", "handler"})
    private Developer author;

    private int upvotes = 0;
    private int downvotes = 0;

    public JobOffer() {}

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getSourcePlatform() { return sourcePlatform; }
    public void setSourcePlatform(String sourcePlatform) { this.sourcePlatform = sourcePlatform; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Developer getAuthor() { return author; }
    public void setAuthor(Developer author) { this.author = author; }

    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }

    public int getDownvotes() { return downvotes; }
    public void setDownvotes(int downvotes) { this.downvotes = downvotes; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    @com.fasterxml.jackson.annotation.JsonManagedReference
    @OneToMany(mappedBy = "jobOffer", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<JobOfferVote> votes = new java.util.ArrayList<>();

    public java.util.List<JobOfferVote> getVotes() { return votes; }
    public void setVotes(java.util.List<JobOfferVote> votes) { this.votes = votes; }
}
