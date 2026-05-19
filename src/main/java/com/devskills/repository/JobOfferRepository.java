package com.devskills.repository;

import com.devskills.model.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
    Optional<JobOffer> findByExternalId(String externalId);
    Optional<JobOffer> findBySourceUrl(String sourceUrl);
    boolean existsByExternalId(String externalId);

    @org.springframework.data.jpa.repository.Query("SELECT j FROM JobOffer j LEFT JOIN FETCH j.author")
    org.springframework.data.domain.Page<JobOffer> findAllWithAuthor(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT j FROM JobOffer j LEFT JOIN FETCH j.author WHERE j.jobType = :jobType")
    org.springframework.data.domain.Page<JobOffer> findByJobTypeWithAuthor(
        @org.springframework.data.repository.query.Param("jobType") String jobType,
        org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query(
        "SELECT j FROM JobOffer j LEFT JOIN FETCH j.author " +
        "WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.tags) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))"
    )
    org.springframework.data.domain.Page<JobOffer> findBySearchWithAuthor(
        @org.springframework.data.repository.query.Param("search") String search,
        org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query(
        "SELECT j FROM JobOffer j LEFT JOIN FETCH j.author " +
        "WHERE j.jobType = :jobType AND (" +
        "LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.company) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.tags) LIKE LOWER(CONCAT('%', :search, '%')) " +
        "OR LOWER(j.location) LIKE LOWER(CONCAT('%', :search, '%'))" +
        ")"
    )
    org.springframework.data.domain.Page<JobOffer> findBySearchAndJobTypeWithAuthor(
        @org.springframework.data.repository.query.Param("search") String search,
        @org.springframework.data.repository.query.Param("jobType") String jobType,
        org.springframework.data.domain.Pageable pageable
    );
}
