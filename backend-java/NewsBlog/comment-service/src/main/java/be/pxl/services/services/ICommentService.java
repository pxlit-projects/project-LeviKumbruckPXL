package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;

import java.util.List;

public interface ICommentService {


    List<CommentDto> getAllPosts();


    CommentDto getPostById(Long id);


    CommentDto createPost(CommentDto commentDto);


    CommentDto updatePost(Long id, CommentDto commentDto);


    void deletePost(Long id);
}
