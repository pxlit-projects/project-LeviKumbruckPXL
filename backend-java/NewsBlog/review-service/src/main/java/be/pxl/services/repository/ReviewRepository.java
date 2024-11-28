package be.pxl.services.repository;

import be.pxl.services.domain.Review;
import be.pxl.services.domain.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findReviewByStatus(ReviewStatus status);

    Review findByPostId(Long postId);
}
