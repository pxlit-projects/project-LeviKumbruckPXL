package be.pxl.services.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse{

    private Long id;
    private Long postId;
    private String redactor;
    private String message;
}
