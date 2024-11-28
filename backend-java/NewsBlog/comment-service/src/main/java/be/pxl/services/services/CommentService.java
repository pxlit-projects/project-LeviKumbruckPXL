package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService implements ICommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // US:10 reactie plaatsen op een post
    @Override
    public void addComment(Long postId, CommentDto commentDto) {
        Comment comment = mapToComment(commentDto);
        commentRepository.save(comment);
    }

    // US-11: comment van andere collega's kunnen lezen
    @Override
    public List<CommentDto> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream().map(this::mapToCommentDto).collect(Collectors.toList());
    }

    // US-12: Eigen reacties bewerken of verwijderen
    @Override
    public void editComment(Long commentId, CommentDto commentDto) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        comment.setContent(commentDto.content());
        commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    //private methods
    private CommentDto mapToCommentDto(Comment comment) {
        return new CommentDto(comment.getPostId(), comment.getUser(),  comment.getContent());
    }

    private Comment mapToComment(CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setPostId(commentDto.postId());
        comment.setUser(commentDto.user());
        comment.setContent(commentDto.content());
        return comment;
    }
}