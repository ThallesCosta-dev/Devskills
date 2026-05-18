package com.devskills.controller;

import com.devskills.model.JobOffer;
import com.devskills.repository.JobOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobOfferController {

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @GetMapping("/market")
    public List<JobOffer> getMarketJobs() {
        return jobOfferRepository.findAll();
    }

    @PostMapping
    public JobOffer createJobOffer(@RequestBody JobOffer jobOffer) {
        return jobOfferRepository.save(jobOffer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOffer> getJobOfferById(@PathVariable Long id) {
        return jobOfferRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
        if (!jobOfferRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobOfferRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<JobOffer> upvoteJobOffer(@PathVariable Long id) {
        return jobOfferRepository.findById(id).map(job -> {
            job.setUpvotes(job.getUpvotes() + 1);
            return ResponseEntity.ok(jobOfferRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/downvote")
    public ResponseEntity<JobOffer> downvoteJobOffer(@PathVariable Long id) {
        return jobOfferRepository.findById(id).map(job -> {
            job.setDownvotes(job.getDownvotes() + 1);
            return ResponseEntity.ok(jobOfferRepository.save(job));
        }).orElse(ResponseEntity.notFound().build());
    }
}
