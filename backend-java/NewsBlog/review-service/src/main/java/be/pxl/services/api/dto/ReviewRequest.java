package be.pxl.services.api.dto;

import be.pxl.services.domain.ReviewStatus;

public record ReviewRequest(Long postId, String comment) {
}
