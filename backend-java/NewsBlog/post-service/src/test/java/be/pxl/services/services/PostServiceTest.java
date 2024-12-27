package be.pxl.services.services;

import be.pxl.services.api.dto.PostRequest;
import be.pxl.services.api.dto.PostResponse;
import be.pxl.services.domain.Post;
import be.pxl.services.domain.PostStatus;
import be.pxl.services.domain.ReviewResponse;
import be.pxl.services.repository.PostRepository;
import be.pxl.services.client.ReviewClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private ReviewClient reviewClient;

    @InjectMocks
    private PostService postService;

    private PostRequest postRequest;
    private Post savedPost;

    @BeforeEach
    public void setUp() {
        postRequest = PostRequest.builder()
                .title("Test Title")
                .content("Test Content")
                .redactor("test_redactor")
                .build();

        savedPost = Post.builder()
                .id(1L)
                .title("Test Title")
                .content("Test Content")
                .redactor("test_redactor")
                .status(PostStatus.UNDER_REVIEW)
                .createdDate(LocalDateTime.now())
                .build();
    }

    @Test
    public void testAddPost() {
        // Arrange
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post post = invocation.getArgument(0);
            post.setId(1L);
            return post;
        });

        // Act
        PostResponse response = postService.addPost(postRequest);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).save(postCaptor.capture());
        verify(reviewClient, times(1)).sendPostForReview(any());

        Post capturedPost = postCaptor.getValue();
        assertEquals("Test Title", capturedPost.getTitle());
        assertEquals("Test Content", capturedPost.getContent());
        assertEquals("test_redactor", capturedPost.getRedactor());
        assertEquals(PostStatus.UNDER_REVIEW, capturedPost.getStatus());
        assertNotNull(capturedPost.getCreatedDate());

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Test Title", response.getTitle());
        assertEquals("Test Content", response.getContent());
        assertEquals("test_redactor", response.getRedactor());
        assertEquals(PostStatus.UNDER_REVIEW, response.getStatus());
        assertNotNull(response.getCreatedDate());
    }

    @Test
    public void testGetDraftsByRedactor() {
        // Arrange
        Post draft1 = Post.builder()
                .id(1L)
                .title("Draft 1")
                .content("Content 1")
                .redactor("test_redactor")
                .status(PostStatus.DRAFT)
                .createdDate(LocalDateTime.now())
                .build();

        Post draft2 = Post.builder()
                .id(2L)
                .title("Draft 2")
                .content("Content 2")
                .redactor("test_redactor")
                .status(PostStatus.DRAFT)
                .createdDate(LocalDateTime.now())
                .build();

        when(postRepository.findByStatusAndRedactor(PostStatus.DRAFT, "test_redactor"))
                .thenReturn(Arrays.asList(draft1, draft2));

        // Act
        List<PostResponse> drafts = postService.getDraftsByRedactor("test_redactor");

        // Assert
        verify(postRepository, times(1)).findByStatusAndRedactor(PostStatus.DRAFT, "test_redactor");
        assertEquals(2, drafts.size());

        PostResponse response1 = drafts.get(0);
        assertEquals(draft1.getId(), response1.getId());
        assertEquals(draft1.getTitle(), response1.getTitle());

        PostResponse response2 = drafts.get(1);
        assertEquals(draft2.getId(), response2.getId());
        assertEquals(draft2.getTitle(), response2.getTitle());
    }

    @Test
    public void testSendDraftForReview_Success() {
        // Arrange
        Long draftId = 1L;
        Post draftPost = Post.builder()
                .id(draftId)
                .title("Draft Title")
                .content("Draft Content")
                .redactor("test_redactor")
                .status(PostStatus.DRAFT)
                .createdDate(LocalDateTime.now())
                .build();

        Post updatedDraft = Post.builder()
                .id(draftId)
                .title("Draft Title")
                .content("Draft Content")
                .redactor("test_redactor")
                .status(PostStatus.UNDER_REVIEW)
                .createdDate(LocalDateTime.now())
                .build();

        when(postRepository.findById(draftId)).thenReturn(Optional.of(draftPost));
        when(postRepository.save(any(Post.class))).thenReturn(updatedDraft);

        // Act
        PostResponse response = postService.sendDraftForReview(draftId);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(2)).save(postCaptor.capture());
        verify(reviewClient, times(1)).sendPostForReview(any());

        List<Post> savedPosts = postCaptor.getAllValues();
        assertEquals(PostStatus.UNDER_REVIEW, savedPosts.get(0).getStatus());
        assertEquals(PostStatus.UNDER_REVIEW, savedPosts.get(1).getStatus());

        assertNotNull(response);
        assertEquals(updatedDraft.getId(), response.getId());
        assertEquals(updatedDraft.getStatus(), response.getStatus());
    }

    @Test
    public void testSendDraftForReview_NotFound() {
        // Arrange
        Long draftId = 1L;
        when(postRepository.findById(draftId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.sendDraftForReview(draftId);
        });

        assertEquals("Draft not found", exception.getMessage());
        verify(postRepository, times(1)).findById(draftId);
        verify(postRepository, never()).save(any(Post.class));
        verify(reviewClient, never()).sendPostForReview(any());
    }

    @Test
    public void testUpdatePost_Success() {
        // Arrange
        Long postId = 1L;
        Post existingPost = Post.builder()
                .id(postId)
                .title("Original Title")
                .content("Original Content")
                .redactor("test_redactor")
                .status(PostStatus.DRAFT)
                .createdDate(LocalDateTime.now())
                .build();

        PostRequest updateRequest = PostRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .redactor("test_redactor")
                .build();

        Post updatedPost = Post.builder()
                .id(postId)
                .title("Updated Title")
                .content("Updated Content")
                .redactor("test_redactor")
                .status(PostStatus.DRAFT)
                .createdDate(LocalDateTime.now())
                .build();

        when(postRepository.findById(postId)).thenReturn(Optional.of(existingPost));
        when(postRepository.save(any(Post.class))).thenReturn(updatedPost);

        // Act
        PostResponse response = postService.updatePost(postId, updateRequest);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).findById(postId);
        verify(postRepository, times(1)).save(postCaptor.capture());

        Post capturedPost = postCaptor.getValue();
        assertEquals("Updated Title", capturedPost.getTitle());
        assertEquals("Updated Content", capturedPost.getContent());
        assertNotNull(capturedPost.getCreatedDate());

        assertNotNull(response);
        assertEquals(updatedPost.getId(), response.getId());
        assertEquals(updatedPost.getTitle(), response.getTitle());
        assertEquals(updatedPost.getContent(), response.getContent());
    }

    @Test
    public void testUpdatePost_NotFound() {
        // Arrange
        Long postId = 1L;
        PostRequest updateRequest = PostRequest.builder()
                .title("Updated Title")
                .content("Updated Content")
                .redactor("test_redactor")
                .build();

        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            postService.updatePost(postId, updateRequest);
        });

        assertEquals("Post not found", exception.getMessage());
        verify(postRepository, times(1)).findById(postId);
        verify(postRepository, never()).save(any(Post.class));
    }

    @Test
    public void testGetAllPosts() {
        // Arrange
        Post post1 = Post.builder()
                .id(1L)
                .title("Post 1")
                .content("Content 1")
                .redactor("redactor1")
                .status(PostStatus.PUBLISHED)
                .createdDate(LocalDateTime.now())
                .build();

        Post post2 = Post.builder()
                .id(2L)
                .title("Post 2")
                .content("Content 2")
                .redactor("redactor2")
                .status(PostStatus.PUBLISHED)
                .createdDate(LocalDateTime.now())
                .build();

        when(postRepository.findByStatus(PostStatus.PUBLISHED)).thenReturn(Arrays.asList(post1, post2));

        // Act
        List<PostResponse> posts = postService.getAllPosts();

        // Assert
        verify(postRepository, times(1)).findByStatus(PostStatus.PUBLISHED);
        assertEquals(2, posts.size());

        PostResponse response1 = posts.get(0);
        assertEquals(post1.getId(), response1.getId());
        assertEquals(post1.getTitle(), response1.getTitle());

        PostResponse response2 = posts.get(1);
        assertEquals(post2.getId(), response2.getId());
        assertEquals(post2.getTitle(), response2.getTitle());
    }

    @Test
    public void testFilterPosts() {
        // Arrange
        String contentFilter = "Test Content";
        String redactorFilter = "test_redactor";
        LocalDate dateFilter = LocalDate.of(2024, 12, 26);

        Post post = Post.builder()
                .id(1L)
                .title("Filtered Post")
                .content("Test Content")
                .redactor("test_redactor")
                .status(PostStatus.PUBLISHED)
                .createdDate(LocalDateTime.of(2024, 12, 26, 10, 0))
                .build();

        when(postRepository.filterPosts(contentFilter, redactorFilter, dateFilter))
                .thenReturn(Arrays.asList(post));

        // Act
        List<PostResponse> filteredPosts = postService.filterPosts(contentFilter, redactorFilter, dateFilter);

        // Assert
        verify(postRepository, times(1)).filterPosts(contentFilter, redactorFilter, dateFilter);
        assertEquals(1, filteredPosts.size());

        PostResponse response = filteredPosts.get(0);
        assertEquals(post.getId(), response.getId());
        assertEquals(post.getTitle(), response.getTitle());
        assertEquals(post.getContent(), response.getContent());
    }

    @Test
    public void testHandleReviewResult_Approved() {
        // Arrange
        Long postId = 1L;
        Post post = Post.builder()
                .id(postId)
                .title("Post Title")
                .content("Post Content")
                .redactor("test_redactor")
                .status(PostStatus.UNDER_REVIEW)
                .createdDate(LocalDateTime.now())
                .build();

        ReviewResponse reviewResponse = new ReviewResponse(postId, "lebron jaems", "APPROVED");

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act
        postService.handleReviewResult(reviewResponse);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).findById(postId);
        verify(postRepository, times(1)).save(postCaptor.capture());

        Post capturedPost = postCaptor.getValue();
        assertEquals(PostStatus.PUBLISHED, capturedPost.getStatus());
        assertNull(capturedPost.getReviewComment());
    }


    @Test
    public void testHandleReviewResult_Rejected() {
        // Arrange
        Long postId = 1L;
        String rejectionComment = "Content needs improvement.";
        Post post = Post.builder()
                .id(postId)
                .title("Post Title")
                .content("Post Content")
                .redactor("test_redactor")
                .status(PostStatus.UNDER_REVIEW)
                .createdDate(LocalDateTime.now())
                .build();

        ReviewResponse reviewResponse = new ReviewResponse(postId, rejectionComment, "REJECTED");

        when(postRepository.findById(postId)).thenReturn(Optional.of(post));

        // Act
        postService.handleReviewResult(reviewResponse);

        // Assert
        ArgumentCaptor<Post> postCaptor = ArgumentCaptor.forClass(Post.class);
        verify(postRepository, times(1)).findById(postId);
        verify(postRepository, times(1)).save(postCaptor.capture());

        Post capturedPost = postCaptor.getValue();
        assertEquals(PostStatus.NEEDS_CHANGING, capturedPost.getStatus());
        assertEquals(rejectionComment, capturedPost.getReviewComment());
    }


    @Test
    public void testGetNeedsChangingPosts() {
        // Arrange
        String redactor = "test_redactor";
        Post post1 = Post.builder()
                .id(1L)
                .title("Needs Change Post 1")
                .content("Content 1")
                .redactor(redactor)
                .status(PostStatus.NEEDS_CHANGING)
                .createdDate(LocalDateTime.now())
                .reviewComment("Please update content.")
                .build();

        Post post2 = Post.builder()
                .id(2L)
                .title("Needs Change Post 2")
                .content("Content 2")
                .redactor(redactor)
                .status(PostStatus.NEEDS_CHANGING)
                .createdDate(LocalDateTime.now())
                .reviewComment("Fix typos.")
                .build();

        when(postRepository.findByStatusAndRedactor(PostStatus.NEEDS_CHANGING, redactor))
                .thenReturn(Arrays.asList(post1, post2));

        // Act
        List<PostResponse> needsChangingPosts = postService.getNeedsChangingPosts(redactor);

        // Assert
        verify(postRepository, times(1)).findByStatusAndRedactor(PostStatus.NEEDS_CHANGING, redactor);
        assertEquals(2, needsChangingPosts.size());

        PostResponse response1 = needsChangingPosts.get(0);
        assertEquals(post1.getId(), response1.getId());
        assertEquals(post1.getTitle(), response1.getTitle());
        assertEquals(post1.getReviewComment(), response1.getReviewComment());

        PostResponse response2 = needsChangingPosts.get(1);
        assertEquals(post2.getId(), response2.getId());
        assertEquals(post2.getTitle(), response2.getTitle());
        assertEquals(post2.getReviewComment(), response2.getReviewComment());
    }
}
