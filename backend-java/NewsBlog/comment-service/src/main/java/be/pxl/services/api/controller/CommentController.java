package be.pxl.services.api.controller;


import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.services.ICommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping()
public class CommentController {

    private final ICommentService postService;
    private static final Logger log = LoggerFactory.getLogger(CommentController.class);

    public CommentController(ICommentService postService) {
        this.postService = postService;
    }

    // US10 reactie plaatsen op een post
    @PostMapping("/{postId}")
    public void addComment(@RequestHeader("Role") String role, @PathVariable Long postId, @RequestBody CommentDto commentDto) {
        log.info("Received request to add comment to post with id {}", postId);

        if (!role.equals("user") && !role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to add a comment", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        postService.addComment(postId, commentDto);
    }

    // US11: comment van andere collega's kunnen lezen
    @GetMapping("/{postId}")
    public List<CommentDto> getCommentsByPostId(@PathVariable Long postId) {
        log.info("Received request to get comments of post with id {}", postId);
        return postService.getCommentsByPostId(postId);
    }

    // US12: Eigen reacties bewerken of verwijderen
    @PutMapping("/{commentId}")
    public void editComment(@RequestHeader("Role") String role, @PathVariable Long commentId, @RequestBody CommentDto commentDto) {
        log.info("Received request to edit comment with id {}", commentId);

        if (!role.equals("user") && !role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to edit comment with id {}", role, commentId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        postService.editComment(commentId, commentDto);
    }

    @DeleteMapping("/{commentId}")
    public void deleteComment(@RequestHeader("Role") String role, @PathVariable Long commentId) {
        log.info("Received request to delete comment with id {}", commentId);

        if (!role.equals("user") && !role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to delete comment with id {}", role, commentId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        postService.deleteComment(commentId);
    }
}