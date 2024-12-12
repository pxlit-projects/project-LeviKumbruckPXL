package be.pxl.services.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.client.NotificationClient;
import be.pxl.services.client.PostClient;
import be.pxl.services.domain.NotificationRequest;
import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import be.pxl.services.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final PostClient postClient;
    private final NotificationClient notificationClient;
    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    public ReviewService(ReviewRepository reviewRepository, PostClient postClient, NotificationClient notificationClient) {
        this.reviewRepository = reviewRepository;
        this.postClient = postClient;
        this.notificationClient = notificationClient;
    }


    // US-07: alle under review posts bekijken + kunnen goedkeuren of afkeuren
    @Override
    public List<ReviewResponse> viewSubmittedPosts() {
        log.info("Getting all submitted posts");
        return reviewRepository.findReviewByStatus(ReviewStatus.PENDING).stream()
                .map(this::convertToReviewResponse)
                .toList();
    }

    @Override
    public void approvePost(Long postId) {
        log.info("Approving post with id {}", postId);
        Review review = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        review.setStatus(ReviewStatus.APPROVED);
        reviewRepository.save(review);

        NotificationRequest notificationRequest = new NotificationRequest(postId, "Your post with title \"" + review.getPostTitle() + "\" and id \"" + postId + "\" has been approved");
        notificationClient.sendNotification(notificationRequest);

        postClient.sendReviewResult(new ReviewResponse(postId, review.getPostTitle(), review.getPostContent(), review.getStatus() ,review.getComment()));
    }

    @Override
    public void rejectPost(Long postId, String rejectionComment) {
        log.info("Rejecting post with id {}", postId);
        Review review = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        review.setStatus(ReviewStatus.REJECTED);
        review.setComment(rejectionComment);
        reviewRepository.save(review);

        NotificationRequest notificationRequest = new NotificationRequest(postId, "Your post with title \"" + review.getPostTitle() + "\" and id \"" + postId + "\" has been rejected");
        notificationClient.sendNotification(notificationRequest);

        postClient.sendReviewResult(new ReviewResponse(postId, review.getPostTitle(), review.getPostContent(), review.getStatus() ,review.getComment()));
    }

    // KonijnMQ luisteraar
    @RabbitListener(queues = "reviewQueue")
    public void handleReviewRequest(ReviewRequest reviewRequest) {
        log.info("Processing review request: {}", reviewRequest);
        Review review = convertToReview(reviewRequest);
        review.setStatus(ReviewStatus.PENDING);
        reviewRepository.save(review);
    }

    //private methods
    private Review convertToReview(ReviewRequest reviewDto) {
        Review review = new Review();
        review.setPostId(reviewDto.postId());
        review.setPostTitle(reviewDto.postTitle());
        review.setPostContent(reviewDto.postContent());
        return review;
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        return new ReviewResponse(review.getPostId(),  review.getPostTitle(), review.getPostContent(),  review.getStatus(), review.getComment());
    }
}