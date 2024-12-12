package be.pxl.services.api.controller;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;
import be.pxl.services.services.IReviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public List<ReviewResponse> viewSubmittedPosts(@RequestHeader("Role") String role) {
        log.info("Received request to view submitted posts");

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to view submitted posts", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return reviewService.viewSubmittedPosts();
    }

    @PutMapping("/approve/{postId}")
    public void approvePost(@RequestHeader("Role") String role, @PathVariable Long postId) {
        log.info("Received request to approve post with id {}", postId);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to approve post with id {}", role, postId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        reviewService.approvePost(postId);
    }

    @PutMapping("/reject/{postId}")
    public void rejectPost(@RequestHeader("Role") String role, @PathVariable Long postId, @RequestBody String rejectionComment) {
        log.info("Received request to reject post with id {}", postId);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to reject post with id {}", role, postId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        reviewService.rejectPost(postId, rejectionComment);
    }
}