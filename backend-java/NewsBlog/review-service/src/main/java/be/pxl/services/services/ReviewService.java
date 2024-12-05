package be.pxl.services.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.client.PostClient;
import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import be.pxl.services.repository.ReviewRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;
    private final PostClient postClient;


    public ReviewService(ReviewRepository reviewRepository, PostClient postClient) {
        this.reviewRepository = reviewRepository;
        this.postClient = postClient;
    }

    // US-07: alle under review posts bekijken + kunnen goedkeuren of afkeuren
    @Override
    public List<ReviewResponse> viewSubmittedPosts() {
        return reviewRepository.findReviewByStatus(ReviewStatus.PENDING).stream()
                .map(this::convertToReviewResponse)
                .toList();
    }

    @Override
    public void approvePost(Long postId) {
        Review review = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        review.setStatus(ReviewStatus.APPROVED);
        reviewRepository.save(review);

        postClient.sendReviewResult(new ReviewResponse(postId, review.getPostTitle(), review.getPostContent(), review.getStatus() ,review.getComment()));
    }

    @Override
    public void rejectPost(Long postId, String rejectionComment) {
        Review review = reviewRepository.findByPostIdAndStatus(postId, ReviewStatus.PENDING);
        review.setStatus(ReviewStatus.REJECTED);
        review.setComment(rejectionComment);
        reviewRepository.save(review);

        postClient.sendReviewResult(new ReviewResponse(postId, review.getPostTitle(), review.getPostContent(), review.getStatus() ,review.getComment()));
    }

    // KonijnMQ luisteraar
    @RabbitListener(queues = "reviewQueue")
    public void handleReviewRequest(ReviewRequest reviewRequest) {
        System.out.println("Processing review request: " + reviewRequest);
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