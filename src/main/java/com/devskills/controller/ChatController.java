package com.devskills.controller;

import com.devskills.model.Developer;
import com.devskills.model.Message;
import com.devskills.repository.DeveloperRepository;
import com.devskills.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private DeveloperRepository developerRepository;

    // Get all contacts (users the current user has chatted with)
    @GetMapping("/contacts")
    public ResponseEntity<List<Developer>> getContacts(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        
        List<String> contactIds = messageRepository.findContactIds(userId);
        List<Developer> contacts = contactIds.stream()
            .map(id -> developerRepository.findById(id))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(contacts);
    }

    // Get conversation with a specific user
    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<List<Message>> getConversation(@AuthenticationPrincipal Jwt jwt, @PathVariable String otherUserId) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String myId = jwt.getSubject();
        
        List<Message> messages = messageRepository.findConversation(myId, otherUserId);
        
        // Mark messages as read
        messages.forEach(m -> {
            if (m.getReceiver().getId().equals(myId) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
        });
        
        return ResponseEntity.ok(messages);
    }

    // Send a message
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> payload) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String senderId = jwt.getSubject();
        
        String receiverId = payload.get("receiverId");
        String content = payload.get("content");
        
        if (receiverId == null || content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Receiver ID and content are required");
        }
        
        Optional<Developer> senderOpt = developerRepository.findById(senderId);
        Optional<Developer> receiverOpt = developerRepository.findById(receiverId);
        
        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Users not found");
        }
        
        Message msg = new Message(senderOpt.get(), receiverOpt.get(), content.trim());
        return ResponseEntity.ok(messageRepository.save(msg));
    }
}
