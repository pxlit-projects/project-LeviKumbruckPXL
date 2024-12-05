package be.pxl.services.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Long postId;

    private String postTitle;

    @Column(columnDefinition = "TEXT")
    private String postContent;

    @Enumerated(EnumType.STRING)
    ReviewStatus status;

    private String comment;
}
