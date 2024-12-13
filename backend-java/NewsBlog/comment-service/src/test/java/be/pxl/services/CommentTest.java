package be.pxl.services;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
public class CommentTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CommentRepository commentRepository;

    @Container
    private static MySQLContainer sqlContainer = new MySQLContainer("mysql:5.7.37");

    @DynamicPropertySource
    static void registerMySQLProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", sqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", sqlContainer::getUsername);
        registry.add("spring.datasource.password", sqlContainer::getPassword);
    }

    @BeforeEach
    public void setUp() {
        commentRepository.deleteAll();
    }

    @Test
    public void testAddComment() throws Exception {
        CommentDto commentDto = new CommentDto(null, 1L, "user1", "This is a comment", null);

        mockMvc.perform(MockMvcRequestBuilders.post("/1")
                        .header("Role", "user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDto)))
                .andExpect(status().isOk());

        List<Comment> comments = commentRepository.findAll();
        assertEquals(1, comments.size());
        assertEquals("This is a comment", comments.get(0).getContent());
    }

    @Test
    public void testAddCommentForbidden() throws Exception {
        CommentDto commentDto = new CommentDto(null, 1L, "user1", "This is a comment", null);

        mockMvc.perform(MockMvcRequestBuilders.post("/1")
                        .header("Role", "viewer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetCommentsByPostId() throws Exception {
        Comment comment = Comment.builder()
                .postId(1L)
                .user("user1")
                .content("Comment 1")
                .createdDate(LocalDateTime.now())
                .build();
        commentRepository.save(comment);

        mockMvc.perform(MockMvcRequestBuilders.get("/1"))
                .andExpect(status().isOk());

        List<Comment> comments = commentRepository.findByPostId(1L);
        assertEquals(1, comments.size());
        assertEquals("Comment 1", comments.get(0).getContent());
    }

    @Test
    public void testEditComment() throws Exception {
        Comment comment = Comment.builder()
                .postId(1L)
                .user("user1")
                .content("Original content")
                .createdDate(LocalDateTime.now())
                .build();
        comment = commentRepository.save(comment);

        CommentDto updatedCommentDto = new CommentDto(comment.getId(), 1L, "user1", "Updated content", null);

        mockMvc.perform(MockMvcRequestBuilders.put("/" + comment.getId())
                        .header("Role", "user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedCommentDto)))
                .andExpect(status().isOk());

        Comment updatedComment = commentRepository.findById(comment.getId()).orElseThrow();
        assertEquals("Updated content", updatedComment.getContent());
    }

    @Test
    public void testEditCommentForbidden() throws Exception {
        Comment comment = Comment.builder()
                .postId(1L)
                .user("user1")
                .content("Original content")
                .createdDate(LocalDateTime.now())
                .build();
        comment = commentRepository.save(comment);

        CommentDto updatedCommentDto = new CommentDto(comment.getId(), 1L, "user1", "Updated content", null);

        mockMvc.perform(MockMvcRequestBuilders.put("/" + comment.getId())
                        .header("Role", "viewer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedCommentDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDeleteComment() throws Exception {
        Comment comment = Comment.builder()
                .postId(1L)
                .user("user1")
                .content("Original content")
                .createdDate(LocalDateTime.now())
                .build();
        comment = commentRepository.save(comment);

        mockMvc.perform(MockMvcRequestBuilders.delete("/" + comment.getId())
                        .header("Role", "user"))
                .andExpect(status().isOk());

        assertEquals(0, commentRepository.findAll().size());
    }

    @Test
    public void testDeleteCommentForbidden() throws Exception {
        Comment comment = Comment.builder()
                .postId(1L)
                .user("user1")
                .content("Original content")
                .createdDate(LocalDateTime.now())
                .build();
        comment = commentRepository.save(comment);

        mockMvc.perform(MockMvcRequestBuilders.delete("/" + comment.getId())
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }
}
