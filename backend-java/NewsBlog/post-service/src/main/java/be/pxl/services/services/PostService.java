package be.pxl.services.services;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.client.ReviewClient;
import be.pxl.services.domain.*;
import be.pxl.services.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService implements IPostService{

    private final PostRepository postRepository;

    private final ReviewClient reviewClient;

    private static final Logger log = LoggerFactory.getLogger(PostService.class);


    //US-1: Post aanmaken
    @Override
    public PostResponse addPost(PostRequest postRequest) {
        log.info("Adding post to the database with title: {}", postRequest.getTitle());
        Post post = mapToPost(postRequest);
        post.setStatus(PostStatus.UNDER_REVIEW);

        //Stuur via RabbitMQ naar review-service
        postRepository.save(post);
        ReviewRequest reviewRequest =
                ReviewRequest.builder()
                        .postId(post.getId())
                        .postTitle(post.getTitle())
                        .postContent(post.getContent())
                        .build();

        reviewClient.sendPostForReview(reviewRequest);
        return mapToPostResponse(post);
    }

    //US-2: Opslaan als concept
    public PostResponse saveAsDraft(PostRequest postRequest) {
        log.info("Saving post as draft to the database with title: {}", postRequest.getTitle());
        Post post = mapToPost(postRequest);
        post.setStatus(PostStatus.DRAFT);
        postRepository.save(post);
        return mapToPostResponse(post);
    }


    public List<PostResponse> getDraftsByRedactor(String redactor) {
        log.info("Getting drafts by redactor: {}", redactor);
        List<Post> drafts = postRepository.findByStatusAndRedactor(PostStatus.DRAFT, redactor);
        return drafts.stream().map(this::mapToPostResponse).toList();
    }


    public PostResponse sendDraftForReview(Long id) {
        log.info("Sending draft for review with id: {}", id);
        Post draft = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));



        draft.setStatus(PostStatus.UNDER_REVIEW);
        draft.setCreatedDate(LocalDateTime.now());


        //Stuur via RabbitMQ naar review-service
        postRepository.save(draft);
        ReviewRequest reviewRequest =
                ReviewRequest.builder()
                        .postId(draft.getId())
                        .postTitle(draft.getTitle())
                        .postContent(draft.getContent())
                        .build();

        reviewClient.sendPostForReview(reviewRequest);

        postRepository.save(draft);
        return mapToPostResponse(draft);
    }

    //US-3: Inhoud post bewerken
    @Override
    public PostResponse updatePost(Long id, PostRequest postRequest) {
        log.info("Updating post with id: {}", id);
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));


        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setCreatedDate(LocalDateTime.now());


        postRepository.save(post);
        return mapToPostResponse(post);
    }

    //US-4: Overzicht published posts
    @Override
    public List<PostResponse> getAllPosts() {
        log.info("Getting all posts");
        List<Post> posts = postRepository.findByStatus(PostStatus.PUBLISHED);
        return posts.stream().map(this::mapToPostResponse).collect(Collectors.toList());
    }

    //US-5: filter posts
    @Override
    public List<PostResponse> filterPosts(String content, String redactor, LocalDate date) {
        log.info("Getting filtered posts");
        List<Post> posts = postRepository.filterPosts(
                content != null && !content.isEmpty() ? content : null,
                redactor != null && !redactor.isEmpty() ? redactor : null,
                date
        );

        return posts.stream().map(this::mapToPostResponse).toList();
    }


    //KonijnMQ Luisteraar
    @RabbitListener(queues = "postQueue")
    public void handleReviewResult(ReviewResponse reviewResponse) {
        log.info("Received review result with postId: {}", reviewResponse.getPostId());
        Long postId = reviewResponse.getPostId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        System.out.println("Processing review result with postId: " + reviewResponse.getPostId());

        if ("APPROVED".equals(reviewResponse.getStatus())) {
            post.setStatus(PostStatus.PUBLISHED);
        } else if ("REJECTED".equals(reviewResponse.getStatus())) {
            post.setStatus(PostStatus.NEEDS_CHANGING);
            post.setReviewComment(reviewResponse.getComment());
        }
        postRepository.save(post);
    }

    //voor coolheid
    @Override
    public List<PostResponse> getNeedsChangingPosts(String redactor) {
        log.info("Getting posts that need changing by redactor: {}", redactor);
        List<Post> posts = postRepository.findByStatusAndRedactor(PostStatus.NEEDS_CHANGING, redactor);
        return posts.stream().map(this::mapToPostResponse).toList();
    }


    //private methodes
    private PostResponse mapToPostResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .redactor(post.getRedactor())
                .createdDate(post.getCreatedDate())
                .status(post.getStatus())
                .reviewComment(post.getReviewComment())
                .build();
    }

    private Post mapToPost(PostRequest postRequest) {
        return Post.builder()
                .title(postRequest.getTitle())
                .content(postRequest.getContent())
                .redactor(postRequest.getRedactor())
                .createdDate(LocalDateTime.now())
                .build();
    }
}