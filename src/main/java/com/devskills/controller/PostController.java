package com.devskills.controller;

import com.devskills.model.Developer;
import com.devskills.model.Post;
import com.devskills.model.PostVote;
import com.devskills.model.Notification;
import com.devskills.repository.DeveloperRepository;
import com.devskills.repository.NotificationRepository;
import com.devskills.repository.PostRepository;
import com.devskills.repository.PostVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private DeveloperRepository developerRepository;

    @Autowired
    private PostVoteRepository postVoteRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createPost(@AuthenticationPrincipal Jwt jwt, @RequestBody Post post) {
        if (jwt == null) return ResponseEntity.status(401).build();
        Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());
        if (devOpt.isEmpty()) return ResponseEntity.notFound().build();

        post.setAuthor(devOpt.get());
        Post savedPost = postRepository.save(post);
        
        // Check for mentions in content
        if (post.getContent() != null) {
            Pattern mentionPattern = Pattern.compile("@([a-zA-Z0-9_\\-]+)");
            Matcher matcher = mentionPattern.matcher(post.getContent());
            while (matcher.find()) {
                String mentionedUsername = matcher.group(1);
                developerRepository.findByUsername(mentionedUsername).ifPresent(mentionedDev -> {
                    if (!mentionedDev.getId().equals(devOpt.get().getId())) {
                        Notification notif = new Notification(mentionedDev, devOpt.get().getName() + " marcou você em uma publicação.", "/timeline");
                        notificationRepository.save(notif);
                    }
                });
            }
        }
        
        return ResponseEntity.ok(savedPost);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody Post updateReq) {
        if (jwt == null) return ResponseEntity.status(401).build();

        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        Post post = postOpt.get();
        if (!post.getAuthor().getId().equals(jwt.getSubject())) {
            return ResponseEntity.status(403).body("Você só pode editar seus próprios posts");
        }

        post.setTitle(updateReq.getTitle());
        post.setContent(updateReq.getContent());
        post.setSubreddit(updateReq.getSubreddit());
        return ResponseEntity.ok(postRepository.save(post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        if (jwt == null) return ResponseEntity.status(401).build();

        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        Post post = postOpt.get();
        if (!post.getAuthor().getId().equals(jwt.getSubject())) {
            return ResponseEntity.status(403).body("Você só pode apagar seus próprios posts");
        }

        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> votePost(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        if (jwt == null) return ResponseEntity.status(401).build();
        int voteValue = payload.getOrDefault("vote", 0);
        if (voteValue != 1 && voteValue != -1) return ResponseEntity.badRequest().body("Voto inválido");

        Optional<Post> postOpt = postRepository.findById(id);
        Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());

        if (postOpt.isEmpty() || devOpt.isEmpty()) return ResponseEntity.notFound().build();

        Post post = postOpt.get();
        Developer dev = devOpt.get();

        Optional<PostVote> existingVote = postVoteRepository.findByPostIdAndDeveloperId(post.getId(), dev.getId());

        if (existingVote.isPresent()) {
            PostVote vote = existingVote.get();
            if (vote.getVoteValue() == voteValue) {
                // Remove vote if clicking same button again
                postVoteRepository.delete(vote);
                if (voteValue == 1) post.setUpvotes(post.getUpvotes() - 1);
                else post.setDownvotes(post.getDownvotes() - 1);
            } else {
                // Change vote
                if (voteValue == 1) {
                    post.setDownvotes(post.getDownvotes() - 1);
                    post.setUpvotes(post.getUpvotes() + 1);
                } else {
                    post.setUpvotes(post.getUpvotes() - 1);
                    post.setDownvotes(post.getDownvotes() + 1);
                }
                vote.setVoteValue(voteValue);
                postVoteRepository.save(vote);
            }
        } else {
            // New vote
            PostVote vote = new PostVote(post, dev, voteValue);
            postVoteRepository.save(vote);
            if (voteValue == 1) post.setUpvotes(post.getUpvotes() + 1);
            else post.setDownvotes(post.getDownvotes() + 1);
        }

        postRepository.save(post);
        
        // Notify post author if someone else voted
        if (!post.getAuthor().getId().equals(dev.getId()) && existingVote.isEmpty() && voteValue == 1) {
            Notification notif = new Notification(post.getAuthor(), dev.getName() + " deu upvote no seu post.", "/community");
            notificationRepository.save(notif);
        }
        
        return ResponseEntity.ok(post);
    }
}
