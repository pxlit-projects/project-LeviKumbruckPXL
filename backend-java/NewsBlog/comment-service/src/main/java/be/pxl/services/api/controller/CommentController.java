package be.pxl.services.api.controller;


import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.services.ICommentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class CommentController {


    private final ICommentService postService;

    public CommentController(ICommentService postService) {
        this.postService = postService;
    }


    @GetMapping
    public List<CommentDto> getAllPosts() {
        return postService.getAllPosts();
    }
}
