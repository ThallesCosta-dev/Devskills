package com.devskills.controller;

import com.devskills.model.Post;
import com.devskills.repository.PostRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PostRepository postRepository;

    @Test
    public void getAllPosts_shouldReturnList() throws Exception {
        Post post1 = new Post();
        post1.setId(1L);
        post1.setContent("Test post 1");
        
        Post post2 = new Post();
        post2.setId(2L);
        post2.setContent("Test post 2");

        Mockito.when(postRepository.findAll()).thenReturn(Arrays.asList(post1, post2));

        mockMvc.perform(get("/api/posts").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].content").value("Test post 1"));
    }

    @Test
    public void getPostById_whenExists_shouldReturnPost() throws Exception {
        Post post = new Post();
        post.setId(1L);
        post.setContent("Hello World");
        
        Mockito.when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        mockMvc.perform(get("/api/posts/1").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Hello World"));
    }

    @Test
    public void getPostById_whenNotExists_shouldReturnNotFound() throws Exception {
        Mockito.when(postRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/posts/99").with(jwt()))
                .andExpect(status().isNotFound());
    }
}
