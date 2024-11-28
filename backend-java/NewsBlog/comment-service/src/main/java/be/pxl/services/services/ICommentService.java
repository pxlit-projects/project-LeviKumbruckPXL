package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;

import java.util.List;

public interface ICommentService {


    List<CommentDto> getCommentsByPostId(Long postId);

    void addComment(Long postId, CommentDto commentDto);

    void editComment(Long commentId, CommentDto commentDto);

    void deleteComment(Long commentId);
}
