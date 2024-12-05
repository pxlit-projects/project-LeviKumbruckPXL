package be.pxl.services.api.dto;

import be.pxl.services.domain.ReviewStatus;

public record ReviewResponse(Long postId, String postTitle, String postContent, ReviewStatus status, String comment) {
}
