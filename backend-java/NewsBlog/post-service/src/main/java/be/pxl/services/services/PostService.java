package be.pxl.services.services;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService implements IPostService{

    private final PostRepository postRepository;


    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    //US-1: Post aanmaken
    @Override
    public PostResponse addPost(PostRequest postRequest) {
        Post post = mapToPost(postRequest);
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
        return mapToPostResponse(post);
    }

    //US-2: Opslaan als concept
    public PostResponse saveAsDraft(PostRequest postRequest) {
        Post post = mapToPost(postRequest);
        post.setStatus(PostStatus.DRAFT);
        postRepository.save(post);
        return mapToPostResponse(post);
    }


    public List<PostResponse> getDraftsByRedactor(String redactor) {
        List<Post> drafts = postRepository.findByStatusAndRedactor(PostStatus.DRAFT, redactor);
        return drafts.stream().map(this::mapToPostResponse).toList();
    }

    public PostResponse updateDraft(Long postId, PostRequest postRequest) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getStatus() != PostStatus.DRAFT) {
            throw new RuntimeException("Only drafts can be updated");
        }

        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setCreatedDate(LocalDateTime.now());

        postRepository.save(post);
        return mapToPostResponse(post);
    }

    public PostResponse publishDraft(Long id) {
        Post draft = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        if (draft.getStatus() != PostStatus.DRAFT) {
            throw new RuntimeException("Only drafts can be published");
        }

        draft.setStatus(PostStatus.PUBLISHED);
        draft.setCreatedDate(LocalDateTime.now());
        postRepository.save(draft);
        return mapToPostResponse(draft);
    }

    //US-3: Inhoud (published) post bewerken
    @Override
    public PostResponse updatePost(Long id, PostRequest postRequest) {
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
        List<Post> posts = postRepository.findByStatus(PostStatus.PUBLISHED);
        return posts.stream().map(this::mapToPostResponse).collect(Collectors.toList());
    }

    //US-5: filter posts
    @Override
    public List<PostResponse> filterPosts(String content, String redactor, LocalDate date) {
        List<Post> posts = postRepository.filterPosts(
                content != null && !content.isEmpty() ? content : null,
                redactor != null && !redactor.isEmpty() ? redactor : null,
                date
        );

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
