package be.pxl.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.client.NotificationClient;
import be.pxl.services.client.PostClient;
import be.pxl.services.domain.NotificationRequest;
import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import be.pxl.services.repository.ReviewRepository;
import be.pxl.services.services.ReviewService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Testcontainers
@AutoConfigureMockMvc
public class ReviewTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReviewRepository reviewRepository;

    @Mock
    private ReviewRepository mockReviewRepository;

    @MockBean
    private NotificationClient mockNotificationClient;

    @InjectMocks
    private ReviewService reviewService;

    @Mock
    private PostClient mockPostClient;

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
        reviewRepository.deleteAll();
        reset(mockNotificationClient, mockPostClient);
    }

    @Test
    public void testViewSubmittedPosts() throws Exception {
        Review review = Review.builder()
                .postId(1L)
                .postTitle("Test Post")
                .postContent("Content")
                .status(ReviewStatus.PENDING)
                .build();
        reviewRepository.save(review);

        mockMvc.perform(MockMvcRequestBuilders.get("/viewSubmittedPosts")
                        .header("Role", "redactor"))
                .andExpect(status().isOk());
    }

    @Test
    public void testViewSubmittedPostsForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/viewSubmittedPosts")
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }




    @Test
    public void testApprovePostForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.put("/approve/1")
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }



    @Test
    public void testRejectPostForbidden() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.put("/reject/1")
                        .header("Role", "viewer")
                        .content(objectMapper.writeValueAsString("Needs improvement"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }


    @Test
    public void testViewSubmittedPostsWithValidRole() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/viewSubmittedPosts")
                        .header("Role", "redactor"))
                .andExpect(status().isOk());
    }

    @Test
    public void testViewSubmittedPostsWithInvalidRole() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/viewSubmittedPosts")
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testApprovePostWithValidRole() throws Exception {
        // Arrange
        Long postId = 1L;
        Review review = Review.builder()
                .postId(postId)
                .postTitle("Sample Post")
                .postContent("Content")
                .status(ReviewStatus.PENDING)
                .build();
        reviewRepository.save(review); // Save a review in the repository

        NotificationRequest notificationRequest = new NotificationRequest(postId, "Your post with title \"Sample Post\" and id \"1\" has been approved");
        doNothing().when(mockNotificationClient).sendNotification(notificationRequest); // Mock notification client

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.put("/approve/" + postId)
                        .header("Role", "redactor"))
                .andExpect(status().isOk());

        // Verify the review is updated
        Review updatedReview = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.APPROVED);
        assertEquals(ReviewStatus.APPROVED, updatedReview.getStatus());
        verify(mockNotificationClient, times(1)).sendNotification(notificationRequest);
    }

    @Test
    public void testApprovePostWithInvalidRole() throws Exception {
        Long postId = 1L;

        mockMvc.perform(MockMvcRequestBuilders.put("/approve/" + postId)
                        .header("Role", "viewer"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testRejectPostWithValidRole() throws Exception {
        // Arrange
        Long postId = 1L;
        String rejectionComment = "Not sufficient quality";
        Review review = Review.builder()
                .postId(postId)
                .postTitle("Sample Post")
                .postContent("Content")
                .status(ReviewStatus.PENDING)
                .build();
        reviewRepository.save(review); // Save a review in the repository

        NotificationRequest notificationRequest = new NotificationRequest(postId, "Your post with title \"Sample Post\" and id \"1\" has been rejected");
        doNothing().when(mockNotificationClient).sendNotification(any(NotificationRequest.class)); // Mock notification client

        // Act & Assert
        mockMvc.perform(MockMvcRequestBuilders.put("/reject/" + postId)
                        .header("Role", "redactor")
                        .content(rejectionComment) // Send the raw string directly
                        .contentType(MediaType.TEXT_PLAIN)) // Use TEXT_PLAIN since it's a raw string
                .andExpect(status().isOk());

        // Verify the review is updated
        Review updatedReview = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.REJECTED);
        assertEquals(ReviewStatus.REJECTED, updatedReview.getStatus());
        assertEquals(rejectionComment, updatedReview.getComment());
        verify(mockNotificationClient, times(1)).sendNotification(any(NotificationRequest.class));
    }



    @Test
    public void testRejectPostWithInvalidRole() throws Exception {
        Long postId = 1L;
        String rejectionComment = "Not sufficient quality";

        mockMvc.perform(MockMvcRequestBuilders.put("/reject/" + postId)
                        .header("Role", "viewer")
                        .content(objectMapper.writeValueAsString(rejectionComment))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }


}
