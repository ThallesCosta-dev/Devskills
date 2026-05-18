package com.devskills.repository;

import com.devskills.model.Developer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeveloperRepository extends JpaRepository<Developer, String> {
    java.util.Optional<Developer> findByUsername(String username);
}
