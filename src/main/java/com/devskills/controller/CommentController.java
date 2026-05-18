package com.devskills.controller;

import com.devskills.model.Comment;
import com.devskills.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPost(@PathVariable Long postId) {
        return commentRepository.findByPostId(postId);
    }

    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        return commentRepository.save(comment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        commentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
