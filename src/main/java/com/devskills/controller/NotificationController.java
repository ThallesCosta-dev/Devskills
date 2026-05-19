package com.devskills.controller;

import com.devskills.model.Notification;
import com.devskills.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        return ResponseEntity.ok(notificationRepository.findByDeveloperIdOrderByCreatedAtDesc(userId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        return ResponseEntity.ok(notificationRepository.findByDeveloperIdAndIsReadFalseOrderByCreatedAtDesc(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();

        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent() && notifOpt.get().getDeveloper().getId().equals(userId)) {
            Notification n = notifOpt.get();
            n.setRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        
        List<Notification> unread = notificationRepository.findByDeveloperIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        
        return ResponseEntity.ok().build();
    }
}
