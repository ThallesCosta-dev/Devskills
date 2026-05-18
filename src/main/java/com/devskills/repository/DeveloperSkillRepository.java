package com.devskills.repository;

import com.devskills.model.DeveloperSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeveloperSkillRepository extends JpaRepository<DeveloperSkill, Long> {
}
