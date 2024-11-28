package be.pxl.services.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import be.pxl.services.repository.ReviewRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReviewService implements IReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
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
        Review review = reviewRepository.findByPostId(postId);
        review.setStatus(ReviewStatus.APPROVED);
        reviewRepository.save(review);
    }

    @Override
    public void rejectPost(Long postId) {
        Review review = reviewRepository.findByPostId(postId);
        review.setStatus(ReviewStatus.REJECTED);
        reviewRepository.save(review);
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
        review.setComment(reviewDto.comment());
        return review;
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        return new ReviewResponse(review.getPostId(), review.getStatus(), review.getComment());
    }
}