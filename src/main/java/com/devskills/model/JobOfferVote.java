package com.devskills.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_offer_vote")
public class JobOfferVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_offer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private JobOffer jobOffer;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private Developer developer;

    private int voteValue; // 1 for like, -1 for dislike

    public JobOfferVote() {}

    public JobOfferVote(JobOffer jobOffer, Developer developer, int voteValue) {
        this.jobOffer = jobOffer;
        this.developer = developer;
        this.voteValue = voteValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobOffer getJobOffer() { return jobOffer; }
    public void setJobOffer(JobOffer jobOffer) { this.jobOffer = jobOffer; }
    public Developer getDeveloper() { return developer; }
    public void setDeveloper(Developer developer) { this.developer = developer; }
    public int getVoteValue() { return voteValue; }
    public void setVoteValue(int voteValue) { this.voteValue = voteValue; }
}
