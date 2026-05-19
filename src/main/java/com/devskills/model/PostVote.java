package com.devskills.model;

import jakarta.persistence.*;

@Entity
@Table(name = "post_vote")
public class PostVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Post post;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private Developer developer;

    private int voteValue; // 1 for upvote, -1 for downvote

    public PostVote() {}

    public PostVote(Post post, Developer developer, int voteValue) {
        this.post = post;
        this.developer = developer;
        this.voteValue = voteValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public Developer getDeveloper() { return developer; }
    public void setDeveloper(Developer developer) { this.developer = developer; }
    public int getVoteValue() { return voteValue; }
    public void setVoteValue(int voteValue) { this.voteValue = voteValue; }
}
