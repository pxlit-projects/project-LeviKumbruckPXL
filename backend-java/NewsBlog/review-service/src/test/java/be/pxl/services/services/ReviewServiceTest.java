package be.pxl.services.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.client.NotificationClient;
import be.pxl.services.client.PostClient;
import be.pxl.services.domain.NotificationRequest;
import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import be.pxl.services.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private PostClient postClient;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private ReviewService reviewService;

    private Review pendingReview;
    private Review approvedReview;
    private Review rejectedReview;

    @BeforeEach
    public void setUp() {
        pendingReview = Review.builder()
                .postId(1L)
                .postTitle("Pending Post")
                .postContent("Content of pending post")
                .status(ReviewStatus.PENDING)
                .build();

        approvedReview = Review.builder()
                .postId(1L)
                .postTitle("Approved Post")
                .postContent("Content of approved post")
                .status(ReviewStatus.APPROVED)
                .build();

        rejectedReview = Review.builder()
                .postId(2L)
                .postTitle("Rejected Post")
                .postContent("Content of rejected post")
                .status(ReviewStatus.REJECTED)
                .comment("Needs improvement")
                .build();
    }

    @Test
    public void testViewSubmittedPosts() {
        // Arrange
        Review pendingReview2 = Review.builder()
                .postId(2L)
                .postTitle("Another Pending Post")
                .postContent("More content")
                .status(ReviewStatus.PENDING)
                .build();

        when(reviewRepository.findReviewByStatus(ReviewStatus.PENDING))
                .thenReturn(Arrays.asList(pendingReview, pendingReview2));

        // Act
        List<ReviewResponse> responses = reviewService.viewSubmittedPosts();

        // Assert
        verify(reviewRepository, times(1)).findReviewByStatus(ReviewStatus.PENDING);
        assertEquals(2, responses.size());

        ReviewResponse response1 = responses.get(0);
        assertEquals(1L, response1.postId());
        assertEquals("Pending Post", response1.postTitle());
        assertEquals("Content of pending post", response1.postContent());
        assertEquals(ReviewStatus.PENDING, response1.status());
        assertNull(response1.comment());

        ReviewResponse response2 = responses.get(1);
        assertEquals(2L, response2.postId());
        assertEquals("Another Pending Post", response2.postTitle());
        assertEquals("More content", response2.postContent());
        assertEquals(ReviewStatus.PENDING, response2.status());
        assertNull(response2.comment());
    }

    @Test
    public void testApprovePost_Success() {
        // Arrange
        Long postId = 1L;
        when(reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING))
                .thenReturn(pendingReview);
        when(reviewRepository.save(any(Review.class))).thenReturn(approvedReview);

        // Act
        reviewService.approvePost(postId);

        // Assert
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        verify(reviewRepository, times(1)).save(reviewCaptor.capture());
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
        verify(postClient, times(1)).sendReviewResult(any(ReviewResponse.class));

        Review savedReview = reviewCaptor.getValue();
        assertEquals(ReviewStatus.APPROVED, savedReview.getStatus());

        ArgumentCaptor<NotificationRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notificationClient).sendNotification(notificationCaptor.capture());
        NotificationRequest sentNotification = notificationCaptor.getValue();
        assertEquals(postId, sentNotification.getPostId());
        assertEquals("Your post with title \"Pending Post\" and id \"1\" has been approved", sentNotification.getMessage());

        ArgumentCaptor<ReviewResponse> reviewResponseCaptor = ArgumentCaptor.forClass(ReviewResponse.class);
        verify(postClient).sendReviewResult(reviewResponseCaptor.capture());
        ReviewResponse sentReviewResponse = reviewResponseCaptor.getValue();
        assertEquals(postId, sentReviewResponse.postId());
        assertEquals("Pending Post", sentReviewResponse.postTitle());
        assertEquals("Content of pending post", sentReviewResponse.postContent());
        assertEquals(ReviewStatus.APPROVED, sentReviewResponse.status());
        assertNull(sentReviewResponse.comment());
    }

    @Test
    public void testApprovePost_NotFound() {
        // Arrange
        Long postId = 99L;
        when(reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING))
                .thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reviewService.approvePost(postId);
        });


        assertInstanceOf(NullPointerException.class, exception);

        verify(reviewRepository, times(1)).findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        verify(reviewRepository, never()).save(any(Review.class));
        verify(notificationClient, never()).sendNotification(any(NotificationRequest.class));
        verify(postClient, never()).sendReviewResult(any(ReviewResponse.class));
    }

    @Test
    public void testRejectPost_Success() {
        // Arrange
        Long postId = 2L;
        String rejectionComment = "Content needs improvement.";
        when(reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING))
                .thenReturn(pendingReview);
        when(reviewRepository.save(any(Review.class))).thenReturn(rejectedReview);

        // Act
        reviewService.rejectPost(postId, rejectionComment);

        // Assert
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        verify(reviewRepository, times(1)).save(reviewCaptor.capture());
        verify(notificationClient, times(1)).sendNotification(any(NotificationRequest.class));
        verify(postClient, times(1)).sendReviewResult(any(ReviewResponse.class));

        Review savedReview = reviewCaptor.getValue();
        assertEquals(ReviewStatus.REJECTED, savedReview.getStatus());
        assertEquals(rejectionComment, savedReview.getComment());

        // Optionally, verify the contents of NotificationRequest and ReviewResponse
        ArgumentCaptor<NotificationRequest> notificationCaptor = ArgumentCaptor.forClass(NotificationRequest.class);
        verify(notificationClient).sendNotification(notificationCaptor.capture());
        NotificationRequest sentNotification = notificationCaptor.getValue();
        assertEquals(postId, sentNotification.getPostId());
        assertEquals("Your post with title \"Pending Post\" and id \"2\" has been rejected", sentNotification.getMessage());

        ArgumentCaptor<ReviewResponse> reviewResponseCaptor = ArgumentCaptor.forClass(ReviewResponse.class);
        verify(postClient).sendReviewResult(reviewResponseCaptor.capture());
        ReviewResponse sentReviewResponse = reviewResponseCaptor.getValue();
        assertEquals(postId, sentReviewResponse.postId());
        assertEquals("Pending Post", sentReviewResponse.postTitle());
        assertEquals("Content of pending post", sentReviewResponse.postContent());
        assertEquals(ReviewStatus.REJECTED, sentReviewResponse.status());
        assertEquals(rejectionComment, sentReviewResponse.comment());
    }

    @Test
    public void testRejectPost_NotFound() {
        // Arrange
        Long postId = 99L;
        String rejectionComment = "Content needs improvement.";
        when(reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING))
                .thenReturn(null);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reviewService.rejectPost(postId, rejectionComment);
        });


        assertInstanceOf(NullPointerException.class, exception);

        verify(reviewRepository, times(1)).findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        verify(reviewRepository, never()).save(any(Review.class));
        verify(notificationClient, never()).sendNotification(any(NotificationRequest.class));
        verify(postClient, never()).sendReviewResult(any(ReviewResponse.class));
    }

    @Test
    public void testHandleReviewRequest_Success() {
        // Arrange
        ReviewRequest reviewRequest = new ReviewRequest(3L, "New Post", "New Content");

        Review savedReview = Review.builder()
                .postId(3L)
                .postTitle("New Post")
                .postContent("New Content")
                .status(ReviewStatus.PENDING)
                .build();

        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);

        // Act
        reviewService.handleReviewRequest(reviewRequest);

        // Assert
        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository, times(1)).save(reviewCaptor.capture());

        Review capturedReview = reviewCaptor.getValue();
        assertEquals(3L, capturedReview.getPostId());
        assertEquals("New Post", capturedReview.getPostTitle());
        assertEquals("New Content", capturedReview.getPostContent());
        assertEquals(ReviewStatus.PENDING, capturedReview.getStatus());
        assertNull(capturedReview.getComment());
    }

    @Test
    public void testViewSubmittedPosts_NoPending() {
        // Arrange
        when(reviewRepository.findReviewByStatus(ReviewStatus.PENDING))
                .thenReturn(Arrays.asList());

        // Act
        List<ReviewResponse> responses = reviewService.viewSubmittedPosts();

        // Assert
        verify(reviewRepository, times(1)).findReviewByStatus(ReviewStatus.PENDING);
        assertTrue(responses.isEmpty());
    }

    @Test
    public void testHandleReviewRequest_WithInvalidData() {
        // Arrange
        ReviewRequest invalidReviewRequest = null;

        // Act & Assert
        assertThrows(NullPointerException.class, () -> {
            reviewService.handleReviewRequest(invalidReviewRequest);
        });

        verify(reviewRepository, never()).save(any(Review.class));
    }




}
