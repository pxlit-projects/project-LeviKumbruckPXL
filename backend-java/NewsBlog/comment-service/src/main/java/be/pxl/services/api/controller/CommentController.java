package be.pxl.services.api.controller;


import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.services.ICommentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping()
public class CommentController {


    private final ICommentService postService;

    public CommentController(ICommentService postService) {
        this.postService = postService;
    }

    // US10 reactie plaatsen op een post
    @PostMapping("/{postId}")
    public void addComment(@PathVariable Long postId, @RequestBody CommentDto commentDto) {
        postService.addComment(postId, commentDto);
    }

    // US11: comment van andere collega's kunnen lezen
    @GetMapping("/{postId}")
    public List<CommentDto> getCommentsByPostId(@PathVariable Long postId) {
        return postService.getCommentsByPostId(postId);
    }

    // US12: Eigen reacties bewerken of verwijderen
    @PutMapping("/{commentId}")
    public void editComment(@PathVariable Long commentId, @RequestBody CommentDto commentDto) {
        postService.editComment(commentId, commentDto);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId) {
        postService.deleteComment(commentId);
    }
}