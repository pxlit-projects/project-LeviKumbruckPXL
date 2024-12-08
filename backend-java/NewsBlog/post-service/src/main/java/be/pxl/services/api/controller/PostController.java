package be.pxl.services.api.controller;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.services.IPostService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping
public class PostController {

    private final IPostService postService;

    public PostController(IPostService postService) {
        this.postService = postService;
    }

    //US-1: Post aanmaken
    @PostMapping("/sendForReview")
    public PostResponse addPost(@RequestBody PostRequest postRequest) {
        return postService.addPost(postRequest);
    }

    //US-2: Opslaan als concept
    @PostMapping("/saveAsDraft")
    public PostResponse saveAsDraft(@RequestBody PostRequest postRequest) {
        return postService.saveAsDraft(postRequest);
    }

    @GetMapping("/drafts")
    public ResponseEntity<List<PostResponse>> getDrafts(@RequestParam String redactor) {
        List<PostResponse> drafts = postService.getDraftsByRedactor(redactor);
        return ResponseEntity.ok(drafts);
    }

    @PutMapping("/sendDraftForReview/{id}")
    public ResponseEntity<PostResponse> sendDraftForReview(@PathVariable Long id) {
        PostResponse publishedPost = postService.sendDraftForReview(id);
        return ResponseEntity.ok(publishedPost);
    }

    // US-3: Update post
    @PutMapping("/updatePost/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id, @RequestBody PostRequest postRequest) {
        PostResponse updatedPost = postService.updatePost(id, postRequest);
        return ResponseEntity.ok(updatedPost);
    }

    //US-4: Overzicht published posts
    @GetMapping("/getAll")
    public List<PostResponse> getAllPosts() {
        return postService.getAllPosts();

    }

    //US-5: filter posts
    @GetMapping("/filter")
    public ResponseEntity<List<PostResponse>> filterPosts(
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String redactor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<PostResponse> filteredPosts = postService.filterPosts(content, redactor, date);
        return ResponseEntity.ok(filteredPosts);
    }

    //voor coolheid
    @GetMapping("/needs-changing")
    public List<PostResponse> getNeedsChangingPosts(@RequestParam String redactor) {
        return postService.getNeedsChangingPosts(redactor);
    }

    //OPEN-FEIGN endpointje:
    @PostMapping("/addComment/{postId}/{commentId}")
    public void addComment(@PathVariable Long postId, @PathVariable Long commentId) {
        postService.addComment(postId, commentId);
    }


}