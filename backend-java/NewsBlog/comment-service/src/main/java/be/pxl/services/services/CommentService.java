package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService implements ICommentService {

    private final CommentRepository commentRepository;
    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

    // US:10 reactie plaatsen op een post
    @Override
    public void addComment(Long postId, CommentDto commentDto) {
        log.info("Adding comment to post with id {}", postId);
        Comment comment = mapToComment(commentDto);
        comment.setCreatedDate(LocalDateTime.now());
        commentRepository.save(comment);
    }

    // US-11: comment van andere collega's kunnen lezen
    @Override
    public List<CommentDto> getCommentsByPostId(Long postId) {
        log.info("Getting comments of post with id {}", postId);
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream().map(this::mapToCommentDto).collect(Collectors.toList());
    }

    // US-12: Eigen reacties bewerken of verwijderen
    @Override
    public void editComment(Long commentId, CommentDto commentDto) {
        log.info("Editing comment with id {}", commentId);
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        comment.setContent(commentDto.content());
        commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        log.info("Deleting comment with id {}", commentId);
        commentRepository.deleteById(commentId);
    }

    //private methods
    private CommentDto mapToCommentDto(Comment comment) {
        return new CommentDto(comment.getId(), comment.getPostId(), comment.getUser(), comment.getContent(), comment.getCreatedDate());
    }

    private Comment mapToComment(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setPostId(commentDto.postId());
        comment.setUser(commentDto.user());
        comment.setContent(commentDto.content());
        return comment;
    }
}