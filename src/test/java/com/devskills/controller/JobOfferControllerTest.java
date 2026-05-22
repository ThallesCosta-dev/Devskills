package com.devskills.controller;

import com.devskills.model.JobOffer;
import com.devskills.repository.JobOfferRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class JobOfferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobOfferRepository jobOfferRepository;

    @Test
    public void getMarketJobs_shouldReturnList() throws Exception {
        JobOffer job1 = new JobOffer();
        job1.setId(1L);
        job1.setTitle("Java Developer");
        job1.setCompany("TechCorp");

        Mockito.when(jobOfferRepository.findAllWithAuthor()).thenReturn(new java.util.ArrayList<>(Arrays.asList(job1)));

        mockMvc.perform(get("/api/jobs/market").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Java Developer"));
    }

    @Test
    public void getJobOfferById_whenExists_shouldReturnJobOffer() throws Exception {
        JobOffer job = new JobOffer();
        job.setId(2L);
        job.setTitle("Frontend Dev");

        Mockito.when(jobOfferRepository.findById(2L)).thenReturn(Optional.of(job));

        mockMvc.perform(get("/api/jobs/2").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Frontend Dev"));
    }

    @Test
    public void deleteJobOffer_shouldReturnNoContent() throws Exception {
        JobOffer job = new JobOffer();
        job.setId(1L);
        com.devskills.model.Developer author = new com.devskills.model.Developer();
        author.setId("uuid-do-usuario-1234");
        job.setAuthor(author);

        Mockito.when(jobOfferRepository.findById(1L)).thenReturn(Optional.of(job));

        mockMvc.perform(delete("/api/jobs/1")
                .with(jwt().jwt(jwt -> jwt.claim("sub", "uuid-do-usuario-1234"))))
                .andExpect(status().isNoContent());

        Mockito.verify(jobOfferRepository, Mockito.times(1)).delete(job);
    }
}
