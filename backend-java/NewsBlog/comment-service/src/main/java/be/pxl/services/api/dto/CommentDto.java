package be.pxl.services.api.dto;

public record CommentDto(Long postId, String user, String content) {
}
