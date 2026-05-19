package com.devskills.controller;

import com.devskills.model.Developer;
import com.devskills.model.JobOffer;
import com.devskills.model.JobOfferVote;
import com.devskills.repository.DeveloperRepository;
import com.devskills.repository.JobOfferRepository;
import com.devskills.repository.JobOfferVoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
public class JobOfferController {

    @Value("${app.scraper.secret-key:}")
    private String scraperSecretKey;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private DeveloperRepository developerRepository;

    @Autowired
    private JobOfferVoteRepository jobOfferVoteRepository;

    @GetMapping("/market")
    public List<JobOffer> getMarketJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "recent") String sort) {
        
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String typeParam = (type == null || type.trim().isEmpty() || type.equals("ALL")) ? null : type.trim();
        
        org.springframework.data.domain.Sort sortSpecification;
        if ("votes".equals(sort)) {
            sortSpecification = org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Order.desc("upvotes"),
                org.springframework.data.domain.Sort.Order.asc("downvotes"),
                org.springframework.data.domain.Sort.Order.desc("id")
            );
        } else {
            sortSpecification = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id");
        }
        
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(page, size, sortSpecification);
        
        org.springframework.data.domain.Page<JobOffer> resultPage;
        if (searchParam != null && typeParam != null) {
            resultPage = jobOfferRepository.findBySearchAndJobTypeWithAuthor(searchParam, typeParam, pageRequest);
        } else if (searchParam != null) {
            resultPage = jobOfferRepository.findBySearchWithAuthor(searchParam, pageRequest);
        } else if (typeParam != null) {
            resultPage = jobOfferRepository.findByJobTypeWithAuthor(typeParam, pageRequest);
        } else {
            resultPage = jobOfferRepository.findAllWithAuthor(pageRequest);
        }
        
        return resultPage.getContent();
    }

    @PostMapping
    public ResponseEntity<?> createJobOffer(@AuthenticationPrincipal Jwt jwt, @RequestBody JobOffer jobOffer) {
        if (jwt == null) return ResponseEntity.status(401).build();
        Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());
        if (devOpt.isEmpty()) return ResponseEntity.notFound().build();

        if (jobOffer.getSourceUrl() == null || jobOffer.getSourceUrl().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("O link da vaga é obrigatório");
        }

        jobOffer.setAuthor(devOpt.get());
        return ResponseEntity.ok(jobOfferRepository.save(jobOffer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobOfferById(@PathVariable Long id) {
        return jobOfferRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJobOffer(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        if (jwt == null) return ResponseEntity.status(401).build();

        Optional<JobOffer> jobOpt = jobOfferRepository.findById(id);
        if (jobOpt.isEmpty()) return ResponseEntity.notFound().build();

        JobOffer job = jobOpt.get();
        if (job.getAuthor() == null || !job.getAuthor().getId().equals(jwt.getSubject())) {
            return ResponseEntity.status(403).body("Apenas o criador da vaga pode apagá-la");
        }

        jobOfferRepository.delete(job);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteJobOffer(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        if (jwt == null) return ResponseEntity.status(401).build();
        int voteValue = payload.getOrDefault("vote", 0);
        if (voteValue != 1 && voteValue != -1) return ResponseEntity.badRequest().body("Voto inválido");

        Optional<JobOffer> jobOpt = jobOfferRepository.findById(id);
        Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());

        if (jobOpt.isEmpty() || devOpt.isEmpty()) return ResponseEntity.notFound().build();

        JobOffer job = jobOpt.get();
        Developer dev = devOpt.get();

        Optional<JobOfferVote> existingVote = jobOfferVoteRepository.findByJobOfferIdAndDeveloperId(job.getId(), dev.getId());

        if (existingVote.isPresent()) {
            JobOfferVote vote = existingVote.get();
            if (vote.getVoteValue() == voteValue) {
                // Remove vote if clicking same button again
                jobOfferVoteRepository.delete(vote);
                if (voteValue == 1) job.setUpvotes(job.getUpvotes() - 1);
                else job.setDownvotes(job.getDownvotes() - 1);
            } else {
                // Change vote
                if (voteValue == 1) {
                    job.setDownvotes(job.getDownvotes() - 1);
                    job.setUpvotes(job.getUpvotes() + 1);
                } else {
                    job.setUpvotes(job.getUpvotes() - 1);
                    job.setDownvotes(job.getDownvotes() + 1);
                }
                vote.setVoteValue(voteValue);
                jobOfferVoteRepository.save(vote);
            }
        } else {
            // New vote
            JobOfferVote vote = new JobOfferVote(job, dev, voteValue);
            jobOfferVoteRepository.save(vote);
            if (voteValue == 1) job.setUpvotes(job.getUpvotes() + 1);
            else job.setDownvotes(job.getDownvotes() + 1);
        }

        jobOfferRepository.save(job);
        return ResponseEntity.ok(job);
    }

    /**
     * Importação em lote pelo scraper externo.
     * Recebe uma lista de vagas, deduplicando por externalId ou sourceUrl.
     * Protegido por chave secreta no header X-Scraper-Key.
     */
    @PostMapping("/import")
    public ResponseEntity<?> importJobs(
            @RequestHeader(value = "X-Scraper-Key", required = false) String scraperKey,
            @RequestBody List<JobOffer> jobs) {

        String expectedKey = scraperSecretKey;
        if (expectedKey != null && !expectedKey.isBlank() && !expectedKey.equals(scraperKey)) {
            return ResponseEntity.status(403).body("Chave de scraper inválida");
        }

        int imported = 0;
        int skipped = 0;

        for (JobOffer job : jobs) {
            boolean exists = false;
            if (job.getExternalId() != null && !job.getExternalId().isBlank()) {
                exists = jobOfferRepository.existsByExternalId(job.getExternalId());
            } else if (job.getSourceUrl() != null && !job.getSourceUrl().isBlank()) {
                exists = jobOfferRepository.findBySourceUrl(job.getSourceUrl()).isPresent();
            }

            if (!exists) {
                jobOfferRepository.save(job);
                imported++;
            } else {
                skipped++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "imported", imported,
                "skipped", skipped,
                "total", jobs.size()
        ));
    }
}
