package be.pxl.services.services;

import be.pxl.services.api.dto.CommentDto;
import be.pxl.services.domain.Comment;
import be.pxl.services.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private CommentService commentService;

    private CommentDto commentDto;
    private Comment savedComment;

    @BeforeEach
    public void setUp() {
        commentDto = new CommentDto(null, 1L, "user1", "This is a comment", null);
        savedComment = Comment.builder()
                .id(1L)
                .postId(1L)
                .user("user1")
                .content("This is a comment")
                .createdDate(LocalDateTime.now())
                .build();
    }

    @Test
    public void testAddComment() {
        // Arrange
        when(commentRepository.save(any(Comment.class))).thenReturn(savedComment);

        // Act
        commentService.addComment(1L, commentDto);

        // Assert
        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository, times(1)).save(commentCaptor.capture());

        Comment capturedComment = commentCaptor.getValue();
        assertEquals(1L, capturedComment.getPostId());
        assertEquals("user1", capturedComment.getUser());
        assertEquals("This is a comment", capturedComment.getContent());
        assertNotNull(capturedComment.getCreatedDate());
    }

    @Test
    public void testGetCommentsByPostId() {
        // Arrange
        Comment comment1 = Comment.builder()
                .id(1L)
                .postId(1L)
                .user("user1")
                .content("Comment 1")
                .createdDate(LocalDateTime.now())
                .build();

        Comment comment2 = Comment.builder()
                .id(2L)
                .postId(1L)
                .user("user2")
                .content("Comment 2")
                .createdDate(LocalDateTime.now())
                .build();

        when(commentRepository.findByPostId(1L)).thenReturn(Arrays.asList(comment1, comment2));

        // Act
        List<CommentDto> commentDtos = commentService.getCommentsByPostId(1L);

        // Assert
        verify(commentRepository, times(1)).findByPostId(1L);
        assertEquals(2, commentDtos.size());

        CommentDto dto1 = commentDtos.get(0);
        assertEquals(1L, dto1.id());
        assertEquals(1L, dto1.postId());
        assertEquals("user1", dto1.user());
        assertEquals("Comment 1", dto1.content());
        assertNotNull(dto1.createdDate());

        CommentDto dto2 = commentDtos.get(1);
        assertEquals(2L, dto2.id());
        assertEquals(1L, dto2.postId());
        assertEquals("user2", dto2.user());
        assertEquals("Comment 2", dto2.content());
        assertNotNull(dto2.createdDate());
    }

    @Test
    public void testEditComment_Success() {
        // Arrange
        Long commentId = 1L;
        Comment existingComment = Comment.builder()
                .id(commentId)
                .postId(1L)
                .user("user1")
                .content("Original content")
                .createdDate(LocalDateTime.now())
                .build();

        CommentDto updatedCommentDto = new CommentDto(commentId, 1L, "user1", "Updated content", null);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));
        when(commentRepository.save(any(Comment.class))).thenReturn(existingComment);

        // Act
        commentService.editComment(commentId, updatedCommentDto);

        // Assert
        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository, times(1)).findById(commentId);
        verify(commentRepository, times(1)).save(commentCaptor.capture());

        Comment capturedComment = commentCaptor.getValue();
        assertEquals("Updated content", capturedComment.getContent());
    }

    @Test
    public void testEditComment_NotFound() {
        // Arrange
        Long commentId = 1L;
        CommentDto updatedCommentDto = new CommentDto(commentId, 1L, "user1", "Updated content", null);

        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> commentService.editComment(commentId, updatedCommentDto));

        verify(commentRepository, times(1)).findById(commentId);
        verify(commentRepository, never()).save(any(Comment.class));
    }

    @Test
    public void testDeleteComment_Success() {
        // Arrange
        Long commentId = 1L;

        doNothing().when(commentRepository).deleteById(commentId);

        // Act
        commentService.deleteComment(commentId);

        // Assert
        verify(commentRepository, times(1)).deleteById(commentId);
    }

    @Test
    public void testDeleteComment_NotFound() {
        // Arrange
        Long commentId = 1L;
        doThrow(new RuntimeException("Comment not found")).when(commentRepository).deleteById(commentId);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> commentService.deleteComment(commentId));

        verify(commentRepository, times(1)).deleteById(commentId);
    }
}
