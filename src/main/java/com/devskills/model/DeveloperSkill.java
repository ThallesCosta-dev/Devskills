package com.devskills.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "developer_skill")
public class DeveloperSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "developer_id", nullable = false)
    private Developer developer;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String proficiencyLevel; // e.g., Junior, Pleno, Sênior
    private Integer yearsOfExperience;

    // Constructors
    public DeveloperSkill() {}

    public DeveloperSkill(Developer developer, Skill skill, String proficiencyLevel, Integer yearsOfExperience) {
        this.developer = developer;
        this.skill = skill;
        this.proficiencyLevel = proficiencyLevel;
        this.yearsOfExperience = yearsOfExperience;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Developer getDeveloper() { return developer; }
    public void setDeveloper(Developer developer) { this.developer = developer; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
}
