package be.pxl.services.api.dto;

import java.time.LocalDateTime;

public record CommentDto(Long id , Long postId, String user, String content, LocalDateTime createdDate) {
}
