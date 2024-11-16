package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import be.pxl.services.services.converter.CommentConverter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService implements ICommentService {

    private final CommentRepository commentRepository;
    private final CommentConverter commentConverter;


    public CommentService(CommentRepository commentRepository, CommentConverter commentConverter) {
        this.commentRepository = commentRepository;
        this.commentConverter = commentConverter;
    }

    @Override
    public List<CommentDto> getAllPosts() {

        List<Comment> comments = commentRepository.findAll();

        return comments.stream()
                .map(commentConverter::convert)
                .collect(Collectors.toList());
    }


    @Override
    public CommentDto getPostById(Long id) {
        return null;
    }

    @Override
    public void deletePost(Long id) {

    }

    @Override
    public CommentDto updatePost(Long id, CommentDto commentDto) {
        return null;
    }

    @Override
    public CommentDto createPost(CommentDto commentDto) {
        return null;
    }

}
