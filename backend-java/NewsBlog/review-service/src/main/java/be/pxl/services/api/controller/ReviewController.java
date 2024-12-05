package be.pxl.services.api.controller;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.services.IReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class ReviewController {

    private final IReviewService reviewService;

    public ReviewController(IReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // US-07: alle ingediende posts bekijken
    @GetMapping("/viewSubmittedPosts")
    public List<ReviewResponse> viewSubmittedPosts() {
        return reviewService.viewSubmittedPosts();
    }

    @PutMapping("/approve/{postId}")
    public void approvePost(@PathVariable Long postId) {
        reviewService.approvePost(postId);
    }

    @PutMapping("/reject/{postId}")
    public void rejectPost(@PathVariable Long postId, @RequestBody String rejectionComment) {
        reviewService.rejectPost(postId, rejectionComment);
    }

}