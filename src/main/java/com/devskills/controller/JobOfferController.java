package com.devskills.controller;
 
import com.devskills.model.Developer;
import com.devskills.model.JobOffer;
import com.devskills.model.JobOfferVote;
import com.devskills.model.DeveloperSkill;
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
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "recent") String sort) {
        
        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String typeParam = (type == null || type.trim().isEmpty() || type.equals("ALL")) ? null : type.trim();
        
        // 1. Carrega todas as vagas compatíveis com os filtros básicos
        List<JobOffer> allJobs;
        if (searchParam != null && typeParam != null) {
            allJobs = jobOfferRepository.findBySearchAndJobTypeWithAuthor(searchParam, typeParam);
        } else if (searchParam != null) {
            allJobs = jobOfferRepository.findBySearchWithAuthor(searchParam);
        } else if (typeParam != null) {
            allJobs = jobOfferRepository.findByJobTypeWithAuthor(typeParam);
        } else {
            allJobs = jobOfferRepository.findAllWithAuthor();
        }

        // 2. Extrai as habilidades do usuário atual (se autenticado)
        List<String> userSkills = new java.util.ArrayList<>();
        if (jwt != null) {
            Optional<Developer> devOpt = developerRepository.findById(jwt.getSubject());
            if (devOpt.isPresent()) {
                Developer dev = devOpt.get();
                if (dev.getSkills() != null) {
                    for (DeveloperSkill ds : dev.getSkills()) {
                        if (ds.getSkill() != null && ds.getSkill().getName() != null) {
                            userSkills.add(ds.getSkill().getName().toLowerCase().trim());
                        }
                    }
                }
            }
        }

        // 3. Aplica ordenação refinada: prioriza vagas do período mais recente e, dentro dele, BR + Compatibilidade
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        allJobs.sort((a, b) -> {
            // 3.1 Idade em dias das vagas
            long daysA = a.getCreatedAt() != null ? java.time.temporal.ChronoUnit.DAYS.between(a.getCreatedAt(), now) : 999;
            long daysB = b.getCreatedAt() != null ? java.time.temporal.ChronoUnit.DAYS.between(b.getCreatedAt(), now) : 999;
            
            if (daysA < 0) daysA = 0;
            if (daysB < 0) daysB = 0;

            // Classifica em faixas de tempo: 0 = Últimas 24h, 1 = Últimos 3 dias, 2 = Últimos 7 dias, 3 = Últimos 30 dias, 4 = Mais antigas
            int rangeA = daysA <= 0 ? 0 : (daysA <= 3 ? 1 : (daysA <= 7 ? 2 : (daysA <= 30 ? 3 : 4)));
            int rangeB = daysB <= 0 ? 0 : (daysB <= 3 ? 1 : (daysB <= 7 ? 2 : (daysB <= 30 ? 3 : 4)));

            if (rangeA != rangeB) {
                return Integer.compare(rangeA, rangeB); // Vagas de faixas de tempo mais recentes vêm primeiro
            }

            // 3.2 Habilidades compatíveis (score de afinidade)
            int scoreA = 0;
            int scoreB = 0;
            if (!userSkills.isEmpty()) {
                if (a.getTags() != null) {
                    String tagsA = a.getTags().toLowerCase();
                    for (String skill : userSkills) {
                        if (tagsA.contains(skill)) scoreA++;
                    }
                }
                if (b.getTags() != null) {
                    String tagsB = b.getTags().toLowerCase();
                    for (String skill : userSkills) {
                        if (tagsB.contains(skill)) scoreB++;
                    }
                }
            }

            // 3.3 Identificação de Vagas Brasileiras (BR)
            boolean isBrA = (a.getLocation() != null && (a.getLocation().toLowerCase().contains("brasil") || a.getLocation().toLowerCase().contains("br"))) 
                || (a.getSourcePlatform() != null && (a.getSourcePlatform().toLowerCase().contains("br") || a.getSourcePlatform().toLowerCase().contains("brasil")));
            
            boolean isBrB = (b.getLocation() != null && (b.getLocation().toLowerCase().contains("brasil") || b.getLocation().toLowerCase().contains("br"))) 
                || (b.getSourcePlatform() != null && (b.getSourcePlatform().toLowerCase().contains("br") || b.getSourcePlatform().toLowerCase().contains("brasil")));

            // Prioridade 1: Vagas BR e Compatíveis juntas
            boolean isBrCompA = isBrA && scoreA > 0;
            boolean isBrCompB = isBrB && scoreB > 0;
            if (isBrCompA != isBrCompB) {
                return isBrCompA ? -1 : 1;
            }

            // Prioridade 2: Vagas Brasileiras (BR) no geral
            if (isBrA != isBrB) {
                return isBrA ? -1 : 1;
            }

            // Prioridade 3: Compatibilidade de habilidades
            boolean isCompA = scoreA > 0;
            boolean isCompB = scoreB > 0;
            if (isCompA != isCompB) {
                return isCompA ? -1 : 1;
            }

            // Prioridade 4: Desempate por quantidade de skills compatíveis
            if (scoreA != scoreB) {
                return Integer.compare(scoreB, scoreA);
            }

            // Prioridade 5: Critério Secundário de Votação (se selecionado)
            if ("votes".equals(sort)) {
                int netA = a.getUpvotes() - a.getDownvotes();
                int netB = b.getUpvotes() - b.getDownvotes();
                if (netA != netB) {
                    return Integer.compare(netB, netA);
                }
            }
            
            // Prioridade 6: Data exata de publicação descrescente (mais recentes primeiro)
            if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }

            return Long.compare(b.getId(), a.getId());
        });

        // 4. Paginação em Memória
        int start = page * size;
        if (start >= allJobs.size()) {
            return new java.util.ArrayList<>();
        }
        int end = Math.min(start + size, allJobs.size());
        
        return allJobs.subList(start, end);
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
                // Se a vaga já existe, atualiza a data de publicação real
                Optional<JobOffer> existingJobOpt = Optional.empty();
                if (job.getExternalId() != null && !job.getExternalId().isBlank()) {
                    existingJobOpt = jobOfferRepository.findByExternalId(job.getExternalId());
                } else if (job.getSourceUrl() != null && !job.getSourceUrl().isBlank()) {
                    existingJobOpt = jobOfferRepository.findBySourceUrl(job.getSourceUrl());
                }
                
                if (existingJobOpt.isPresent()) {
                    JobOffer existingJob = existingJobOpt.get();
                    if (job.getCreatedAt() != null) {
                        existingJob.setCreatedAt(job.getCreatedAt());
                        jobOfferRepository.save(existingJob);
                    }
                }
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
