package be.pxl.services.api.controller;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.services.IPostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping
public class PostController {

    private final IPostService postService;
    private static final Logger log = LoggerFactory.getLogger(PostController.class);

    public PostController(IPostService postService) {
        this.postService = postService;
    }

    //US-1: Post aanmaken
    @PostMapping("/sendForReview")
    public PostResponse addPost(@RequestHeader("Role") String role ,@RequestBody PostRequest postRequest) {
        log.info("Received request to add post");

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to add a post", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return postService.addPost(postRequest);
    }

    //US-2: Opslaan als concept
    @PostMapping("/saveAsDraft")
    public PostResponse saveAsDraft(@RequestHeader("Role") String role, @RequestBody PostRequest postRequest) {

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to save a draft", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        log.info("Received request to save as draft");
        return postService.saveAsDraft(postRequest);
    }

    @GetMapping("/drafts")
    public ResponseEntity<List<PostResponse>> getDrafts(@RequestHeader("Role") String role, @RequestParam String redactor) {
        log.info("Received request to get drafts by redactor: {}", redactor);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to get drafts", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        List<PostResponse> drafts = postService.getDraftsByRedactor(redactor);
        return ResponseEntity.ok(drafts);
    }

    @PutMapping("/sendDraftForReview/{id}")
    public ResponseEntity<PostResponse> sendDraftForReview(@RequestHeader("Role") String role, @PathVariable Long id) {
        log.info("Received request to send draft with id {} for review", id);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to send a draft to review", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        PostResponse publishedPost = postService.sendDraftForReview(id);
        return ResponseEntity.ok(publishedPost);
    }

    // US-3: Update post
    @PutMapping("/updatePost/{id}")
    public ResponseEntity<PostResponse> updatePost(@RequestHeader("Role") String role, @PathVariable Long id, @RequestBody PostRequest postRequest) {
        log.info("Received request to update post with id {}", id);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to update post with id {}", role, id);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        PostResponse updatedPost = postService.updatePost(id, postRequest);
        return ResponseEntity.ok(updatedPost);
    }

    //US-4: Overzicht published posts
    @GetMapping("/getAll")
    public List<PostResponse> getAllPosts() {
        log.info("Received request to get all posts");
        return postService.getAllPosts();
    }

    //US-5: filter posts
    @GetMapping("/filter")
    public ResponseEntity<List<PostResponse>> filterPosts(
            @RequestHeader("Role") String role,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String redactor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("Received request to filter posts");
        List<PostResponse> filteredPosts = postService.filterPosts(content, redactor, date);
        return ResponseEntity.ok(filteredPosts);
    }

    //voor coolheid
    @GetMapping("/needs-changing")
    public List<PostResponse> getNeedsChangingPosts(@RequestHeader("Role") String role, @RequestParam String redactor) {
        log.info("Received request to get posts that need changing by redactor: {}", redactor);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to get posts that need changing", role);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return postService.getNeedsChangingPosts(redactor);
    }
}