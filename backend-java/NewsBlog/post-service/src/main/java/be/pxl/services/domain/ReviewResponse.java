package be.pxl.services.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;


    private Long postId;
    private String comment;
    private String status;


}