package com.devskills.controller;

import com.devskills.model.Developer;
import com.devskills.repository.DeveloperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/devskills")
public class DevSkillsController {

    @Autowired
    private DeveloperRepository developerRepository;

    @GetMapping("/me")
    public ResponseEntity<Developer> getUserProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) return ResponseEntity.status(401).build();
        
        String userId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        
        Optional<Developer> devOpt = developerRepository.findById(userId);
        if (devOpt.isPresent()) {
            return ResponseEntity.ok(devOpt.get());
        } else {
            // Create new profile if it doesn't exist
            Developer newDev = new Developer();
            newDev.setId(userId);
            newDev.setEmail(email);
            // Default username based on email
            if (email != null && email.contains("@")) {
                newDev.setUsername(email.split("@")[0] + "_" + userId.substring(0, 4));
            } else {
                newDev.setUsername("user_" + userId.substring(0, 8));
            }
            newDev.setName("New Developer");
            return ResponseEntity.ok(developerRepository.save(newDev));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<Developer> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody Developer updateReq) {
        if (jwt == null) return ResponseEntity.status(401).build();
        
        String userId = jwt.getSubject();
        
        return developerRepository.findById(userId).map(dev -> {
            dev.setName(updateReq.getName());
            dev.setBio(updateReq.getBio());
            dev.setAvatarUrl(updateReq.getAvatarUrl());
            dev.setLocation(updateReq.getLocation());
            dev.setRole(updateReq.getRole());
            dev.setGithub(updateReq.getGithub());
            dev.setLinkedin(updateReq.getLinkedin());
            dev.setPortfolio(updateReq.getPortfolio());
            
            // Check username uniqueness if changed
            if (updateReq.getUsername() != null && !updateReq.getUsername().equals(dev.getUsername())) {
                if (developerRepository.findByUsername(updateReq.getUsername()).isEmpty()) {
                    dev.setUsername(updateReq.getUsername());
                } else {
                    return ResponseEntity.status(409).body(dev); // Conflict
                }
            }
            
            return ResponseEntity.ok(developerRepository.save(dev));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<Developer> getProfileByUsername(@PathVariable String username) {
        return developerRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
