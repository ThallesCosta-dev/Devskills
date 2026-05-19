package com.devskills.repository;

import com.devskills.model.JobOfferVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobOfferVoteRepository extends JpaRepository<JobOfferVote, Long> {
    Optional<JobOfferVote> findByJobOfferIdAndDeveloperId(Long jobOfferId, String developerId);
}
