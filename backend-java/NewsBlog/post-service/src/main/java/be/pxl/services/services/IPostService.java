package be.pxl.services.services;

import be.pxl.services.api.dto.PostDto;

import java.util.List;

public interface IPostService {


    List<PostDto> getAllPosts();


    PostDto getPostById(Long id);


    PostDto createPost(PostDto postDto);


    PostDto updatePost(Long id, PostDto postDto);


    void deletePost(Long id);
}
