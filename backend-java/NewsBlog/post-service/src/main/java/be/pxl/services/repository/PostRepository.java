package be.pxl.services.repository;

import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE " +
            "p.status = 'PUBLISHED' AND " +
            "(:content IS NULL OR LOWER(p.content) LIKE LOWER(CONCAT('%', :content, '%'))) AND " +
            "(:redactor IS NULL OR LOWER(p.redactor) LIKE LOWER(CONCAT('%', :redactor, '%'))) AND " +
            "(:date IS NULL OR DATE(p.createdDate) = :date)")
    List<Post> filterPosts(
            @Param("content") String content,
            @Param("redactor") String redactor,
            @Param("date") LocalDate date
    );



    List<Post> findByStatus(PostStatus status);

    List<Post> findByStatusAndRedactor(PostStatus status, String redactor);
}