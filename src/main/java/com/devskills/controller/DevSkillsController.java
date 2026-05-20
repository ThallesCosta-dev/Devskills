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

    @Autowired
    private com.devskills.repository.DeveloperSkillRepository developerSkillRepository;

    @Autowired
    private com.devskills.repository.SkillRepository skillRepository;

    @GetMapping("/profile/{username}")
    public ResponseEntity<Developer> getProfileByUsername(@PathVariable String username) {
        return developerRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/id/{id}")
    public ResponseEntity<Developer> getProfileById(@PathVariable String id) {
        return developerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/skills")
    public ResponseEntity<?> addSkill(@AuthenticationPrincipal Jwt jwt, @RequestBody java.util.Map<String, String> payload) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        
        Optional<Developer> devOpt = developerRepository.findById(userId);
        if (devOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        String skillName = payload.get("name");
        String proficiency = payload.get("proficiencyLevel");
        
        if (skillName == null || skillName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nome da habilidade é obrigatório");
        }
        
        // Find or create skill
        com.devskills.model.Skill skill = skillRepository.findByNameIgnoreCase(skillName.trim())
                .orElseGet(() -> {
                    com.devskills.model.Skill newSkill = new com.devskills.model.Skill();
                    newSkill.setName(skillName.trim());
                    newSkill.setCategory("Geral");
                    return skillRepository.save(newSkill);
                });
                
        Developer dev = devOpt.get();
        
        // Check if dev already has this skill
        boolean hasSkill = dev.getSkills().stream().anyMatch(ds -> ds.getSkill().getId().equals(skill.getId()));
        if (hasSkill) {
            return ResponseEntity.badRequest().body("Você já adicionou esta habilidade");
        }
        
        com.devskills.model.DeveloperSkill devSkill = new com.devskills.model.DeveloperSkill(dev, skill, proficiency != null ? proficiency : "Iniciante", 0);
        developerSkillRepository.save(devSkill);
        
        // Return updated developer
        return ResponseEntity.ok(developerRepository.findById(userId).get());
    }
    
    @DeleteMapping("/me/skills/{devSkillId}")
    public ResponseEntity<?> removeSkill(@AuthenticationPrincipal Jwt jwt, @PathVariable Long devSkillId) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        
        Optional<com.devskills.model.DeveloperSkill> dsOpt = developerSkillRepository.findById(devSkillId);
        if (dsOpt.isPresent() && dsOpt.get().getDeveloper().getId().equals(userId)) {
            developerSkillRepository.delete(dsOpt.get());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/me/skills/{devSkillId}")
    public ResponseEntity<?> updateSkill(@AuthenticationPrincipal Jwt jwt, @PathVariable Long devSkillId, @RequestBody java.util.Map<String, String> payload) {
        if (jwt == null) return ResponseEntity.status(401).build();
        String userId = jwt.getSubject();
        
        Optional<com.devskills.model.DeveloperSkill> dsOpt = developerSkillRepository.findById(devSkillId);
        if (dsOpt.isPresent() && dsOpt.get().getDeveloper().getId().equals(userId)) {
            com.devskills.model.DeveloperSkill ds = dsOpt.get();
            if (payload.containsKey("proficiencyLevel")) {
                ds.setProficiencyLevel(payload.get("proficiencyLevel"));
                developerSkillRepository.save(ds);
            }
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
