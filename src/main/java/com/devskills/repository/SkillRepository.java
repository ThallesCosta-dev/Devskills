package com.devskills.repository;

import com.devskills.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    java.util.Optional<Skill> findByNameIgnoreCase(String name);
}
