package com.devskills.controller;

import com.devskills.model.Comment;
import com.devskills.model.Developer;
import com.devskills.model.Post;
import com.devskills.model.Comment;
import com.devskills.model.Developer;
import com.devskills.model.Notification;
import com.devskills.model.Post;
import com.devskills.repository.CommentRepository;
import com.devskills.repository.DeveloperRepository;
import com.devskills.repository.NotificationRepository;
import com.devskills.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private DeveloperRepository developerRepository;

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPost(@PathVariable Long postId) {
        return commentRepository.findByPostId(postId);
    }

    @PostMapping
    public ResponseEntity<?> createComment(@AuthenticationPrincipal Jwt jwt, @RequestBody Comment comment) {
        if (jwt == null) return ResponseEntity.status(401).build();
        Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());
        if (devOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        if (comment.getPost() == null || comment.getPost().getId() == null) {
            return ResponseEntity.badRequest().body("Post ID é obrigatório");
        }
        
        Optional<Post> postOpt = postRepository.findById(comment.getPost().getId());
        if (postOpt.isEmpty()) return ResponseEntity.badRequest().body("Post não encontrado");

        comment.setAuthor(devOpt.get());
        comment.setPost(postOpt.get());
        Comment saved = commentRepository.save(comment);
        
        // Notify Post Author
        if (!postOpt.get().getAuthor().getId().equals(devOpt.get().getId())) {
            Notification notif = new Notification(postOpt.get().getAuthor(), devOpt.get().getName() + " comentou no seu post.", "/community");
            notificationRepository.save(notif);
        }
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        if (jwt == null) return ResponseEntity.status(401).build();

        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (commentOpt.isEmpty()) return ResponseEntity.notFound().build();

        Comment comment = commentOpt.get();
        if (comment.getAuthor() == null || !comment.getAuthor().getId().equals(jwt.getSubject())) {
            return ResponseEntity.status(403).body("Apenas o autor pode apagar o comentário");
        }

        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}
