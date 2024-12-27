package be.pxl.services;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.domain.ReviewResponse;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.repository.PostRepository;
import be.pxl.services.services.PostService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
public class PostTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Mock
    private PostRepository mockPostRepository;

    @InjectMocks
    private PostService postService;

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
        postRepository.deleteAll();
        notificationRepository.deleteAll();
    }

    @Test
    public void testSaveAsDraft() throws Exception {
        PostRequest postRequest = PostRequest.builder()
                .title("Draft Title")
                .content("Draft Content")
                .redactor("test_redactor")
                .build();

        String postString = objectMapper.writeValueAsString(postRequest);

        mockMvc.perform(MockMvcRequestBuilders.post("/saveAsDraft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "redactor")
                        .content(postString))
                .andExpect(status().isOk());

        assertEquals(1, postRepository.findAll().size());
    }

    @Test
    public void testSaveAsDraftForbidden() throws Exception {
        PostRequest postRequest = PostRequest.builder()
                .title("Draft Title")
                .content("Draft Content")
                .redactor("test_redactor")
                .build();

        String postString = objectMapper.writeValueAsString(postRequest);

        mockMvc.perform(MockMvcRequestBuilders.post("/saveAsDraft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "viewer")
                        .content(postString))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetDrafts() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/drafts")
                        .header("Role", "redactor")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetDraftsForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/drafts")
                        .header("Role", "viewer")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testUpdatePost() throws Exception {
        // Arrange: Create and save a post
        PostRequest originalPostRequest = PostRequest.builder()
                .title("Original Title")
                .content("Original Content")
                .redactor("test_redactor")
                .build();

        PostResponse savedPost = objectMapper.readValue(mockMvc.perform(MockMvcRequestBuilders.post("/saveAsDraft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "redactor")
                        .content(objectMapper.writeValueAsString(originalPostRequest)))
                .andReturn().getResponse().getContentAsString(), PostResponse.class);

        // Act: Update the saved post
        PostRequest updatedPostRequest = PostRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .redactor("test_redactor")
                .build();

        String postString = objectMapper.writeValueAsString(updatedPostRequest);

        mockMvc.perform(MockMvcRequestBuilders.put("/updatePost/" + savedPost.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "redactor")
                        .content(postString))
                .andExpect(status().isOk());

        // Assert: Verify the changes in the database
        PostResponse updatedPost = objectMapper.readValue(
                mockMvc.perform(MockMvcRequestBuilders.get("/drafts")
                                .header("Role", "redactor")
                                .param("redactor", "test_redactor"))
                        .andReturn().getResponse().getContentAsString(),
                PostResponse[].class
        )[0];

        assertEquals("Updated Title", updatedPost.getTitle());
        assertEquals("Updated Content", updatedPost.getContent());
    }


    @Test
    public void testUpdatePostForbidden() throws Exception {
        PostRequest postRequest = PostRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .redactor("test_redactor")
                .build();

        String postString = objectMapper.writeValueAsString(postRequest);

        mockMvc.perform(MockMvcRequestBuilders.put("/updatePost/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "viewer")
                        .content(postString))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testGetAllPosts() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/getAll"))
                .andExpect(status().isOk());
    }

    @Test
    public void testFilterPosts() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/filter")
                        .header("Role", "redactor")
                        .param("content", "Test Content"))
                .andExpect(status().isOk());
    }


    @Test
    public void testGetNeedsChangingPosts() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/needs-changing")
                        .header("Role", "redactor")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetNeedsChangingPostsForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/needs-changing")
                        .header("Role", "viewer")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isForbidden());
    }



    @Test
    public void testSendDraftForReviewForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.put("/sendDraftForReview/1")
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }



    @Test
    public void testAddPostForbidden() throws Exception {
        PostRequest postRequest = PostRequest.builder()
                .title("Forbidden Post")
                .content("Forbidden Content")
                .redactor("test_redactor")
                .build();

        String postString = objectMapper.writeValueAsString(postRequest);

        mockMvc.perform(MockMvcRequestBuilders.post("/sendForReview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Role", "viewer")
                        .content(postString))
                .andExpect(status().isForbidden());
    }


    @Test
    public void testGetNotificationsOfRedactor() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/notification")
                        .header("Role", "redactor")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetNotificationsOfRedactorForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/notification")
                        .header("Role", "viewer")
                        .param("redactor", "test_redactor"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDeleteNotification() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/notification/1")
                        .header("Role", "redactor"))
                .andExpect(status().isOk());

        assertEquals(0, notificationRepository.findAll().size());
    }

    @Test
    public void testDeleteNotificationForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.delete("/notification/1")
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testHandleReviewResultApproved() {
        // Arrange
        Long postId = 1L;
        Post post = Post.builder()
                .id(postId)
                .title("Test Post")
                .content("Test Content")
                .status(PostStatus.UNDER_REVIEW)
                .build();

        ReviewResponse reviewResponse = ReviewResponse.builder()
                .postId(postId)
                .status("APPROVED")
                .build();

        when(mockPostRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act
        postService.handleReviewResult(reviewResponse);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(mockPostRepository, times(1)).save(postCaptor.capture());

        Post savedPost = postCaptor.getValue();
        assertEquals(PostStatus.PUBLISHED, savedPost.getStatus());
    }

    @Test
    public void testHandleReviewResultRejected() {
        // Arrange
        Long postId = 1L;
        Post post = Post.builder()
                .id(postId)
                .title("Test Post")
                .content("Test Content")
                .status(PostStatus.UNDER_REVIEW)
                .build();

        String rejectionComment = "Content needs improvement.";
        ReviewResponse reviewResponse = ReviewResponse.builder()
                .postId(postId)
                .status("REJECTED")
                .comment(rejectionComment)
                .build();

        when(mockPostRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act
        postService.handleReviewResult(reviewResponse);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(mockPostRepository, times(1)).save(postCaptor.capture());

        Post savedPost = postCaptor.getValue();
        assertEquals(PostStatus.NEEDS_CHANGING, savedPost.getStatus());
        assertEquals(rejectionComment, savedPost.getReviewComment());
    }
}
