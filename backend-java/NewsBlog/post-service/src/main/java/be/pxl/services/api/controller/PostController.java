package be.pxl.services.api.controller;


import be.pxl.services.api.dto.PostDto;
import be.pxl.services.services.IPostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {


    private final IPostService postService;

    public PostController(IPostService postService) {
        this.postService = postService;
    }


    @GetMapping
    public List<PostDto> getAllPosts() {
        return postService.getAllPosts();
    }
}
