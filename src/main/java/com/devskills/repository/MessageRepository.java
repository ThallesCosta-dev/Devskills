package com.devskills.repository;

import com.devskills.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find all messages between two users (ordered by time)
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :user1 AND m.receiver.id = :user2) OR (m.sender.id = :user2 AND m.receiver.id = :user1) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("user1") String user1, @Param("user2") String user2);

    // Find all distinct users that have a conversation with the given user
    @Query("SELECT DISTINCT m.sender.id FROM Message m WHERE m.receiver.id = :userId " +
           "UNION " +
           "SELECT DISTINCT m.receiver.id FROM Message m WHERE m.sender.id = :userId")
    List<String> findContactIds(@Param("userId") String userId);
}
