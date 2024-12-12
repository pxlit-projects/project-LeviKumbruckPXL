package be.pxl.services.api.controller;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.services.IReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class ReviewController {

    private final IReviewService reviewService;
    private static final Logger log = LoggerFactory.getLogger(ReviewController.class);

    public ReviewController(IReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // US-07: alle ingediende posts bekijken
    @GetMapping("/viewSubmittedPosts")
    public List<ReviewResponse> viewSubmittedPosts() {
        log.info("Received request to view submitted posts");
        return reviewService.viewSubmittedPosts();
    }

    @PutMapping("/approve/{postId}")
    public void approvePost(@PathVariable Long postId) {
        log.info("Received request to approve post with id {}", postId);
        reviewService.approvePost(postId);
    }

    @PutMapping("/reject/{postId}")
    public void rejectPost(@PathVariable Long postId, @RequestBody String rejectionComment) {
        log.info("Received request to reject post with id {}", postId);
        reviewService.rejectPost(postId, rejectionComment);
    }
}