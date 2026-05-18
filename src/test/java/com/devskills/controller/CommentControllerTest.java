package com.devskills.controller;

import com.devskills.model.Comment;
import com.devskills.repository.CommentRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CommentRepository commentRepository;

    @Test
    public void getCommentsByPost_shouldReturnList() throws Exception {
        Comment comment1 = new Comment();
        comment1.setId(1L);
        comment1.setContent("Great post!");

        Mockito.when(commentRepository.findByPostId(100L)).thenReturn(Arrays.asList(comment1));

        mockMvc.perform(get("/api/comments/post/100").with(jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].content").value("Great post!"));
    }

    @Test
    public void deleteComment_shouldReturnNoContent() throws Exception {
        Mockito.when(commentRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/comments/1").with(jwt()))
                .andExpect(status().isNoContent());

        Mockito.verify(commentRepository, Mockito.times(1)).deleteById(1L);
    }
}
