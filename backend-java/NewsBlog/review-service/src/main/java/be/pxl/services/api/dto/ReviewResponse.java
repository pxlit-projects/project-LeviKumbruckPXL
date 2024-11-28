package be.pxl.services.api.dto;

import be.pxl.services.domain.ReviewStatus;

public record ReviewResponse(Long postId, ReviewStatus status, String comment) {


}
