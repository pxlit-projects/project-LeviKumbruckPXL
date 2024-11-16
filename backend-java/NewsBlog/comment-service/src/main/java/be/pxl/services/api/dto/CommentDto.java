package be.pxl.services.api.dto;

public record CommentDto(String title, String content, String redactor, boolean published) {
}
