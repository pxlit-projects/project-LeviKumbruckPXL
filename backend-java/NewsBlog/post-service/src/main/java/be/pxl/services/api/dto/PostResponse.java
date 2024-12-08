package be.pxl.services.api.dto;

import be.pxl.services.domain.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;

    private String title;

    private String content;

    private String redactor;

    private LocalDateTime createdDate;

    private PostStatus status;

    private String reviewComment;

    private List<Long> commentIds;
}