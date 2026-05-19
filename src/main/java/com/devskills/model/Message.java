package com.devskills.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Developer sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Developer receiver;

    @Column(columnDefinition = "TEXT")
    private String content;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Message() {}

    public Message(Developer sender, Developer receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Developer getSender() { return sender; }
    public void setSender(Developer sender) { this.sender = sender; }

    public Developer getReceiver() { return receiver; }
    public void setReceiver(Developer receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
