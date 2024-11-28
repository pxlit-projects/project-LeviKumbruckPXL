package be.pxl.services.services;

import be.pxl.services.api.dto.ReviewRequest;
import be.pxl.services.api.dto.ReviewResponse;

import java.util.List;

public interface IReviewService {

    List<ReviewResponse> viewSubmittedPosts();

    void approvePost(Long postId);

    void rejectPost(Long postId);
}