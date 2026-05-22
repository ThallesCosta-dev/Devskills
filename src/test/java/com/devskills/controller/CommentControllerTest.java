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
        Comment comment = new Comment();
        comment.setId(1L);
        com.devskills.model.Developer author = new com.devskills.model.Developer();
        author.setId("uuid-do-usuario-1234");
        comment.setAuthor(author);

        Mockito.when(commentRepository.findById(1L)).thenReturn(java.util.Optional.of(comment));

        mockMvc.perform(delete("/api/comments/1")
                .with(jwt().jwt(jwt -> jwt.claim("sub", "uuid-do-usuario-1234"))))
                .andExpect(status().isNoContent());

        Mockito.verify(commentRepository, Mockito.times(1)).delete(comment);
    }
}
