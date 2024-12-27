package be.pxl.services.services;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.domain.Post;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;
    private Post post;

    @BeforeEach
    public void setUp() {
        notification = Notification.builder()
                .id(1L)
                .postId(1L)
                .message("Test Notification")
                .build();

        post = Post.builder()
                .id(1L)
                .title("Test Post")
                .content("Test Content")
                .redactor("test_redactor")
                .build();
    }

    @Test
    public void testSendNotification_Success() {
        // Arrange
        when(postRepository.findById(notification.getPostId())).thenReturn(Optional.of(post));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        notificationService.sendNotification(notification);

        // Assert
        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(postRepository, times(1)).findById(notification.getPostId());
        verify(notificationRepository, times(1)).save(notificationCaptor.capture());

        Notification capturedNotification = notificationCaptor.getValue();
        assertEquals("test_redactor", capturedNotification.getRedactor());
        assertEquals("Test Notification", capturedNotification.getMessage());
        assertEquals(1L, capturedNotification.getPostId());
    }

    @Test
    public void testSendNotification_PostNotFound() {
        // Arrange
        when(postRepository.findById(notification.getPostId())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.sendNotification(notification);
        });

        assertEquals("Post not found", exception.getMessage());
        verify(postRepository, times(1)).findById(notification.getPostId());
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    public void testGetNotificationsByRedactor() {
        // Arrange
        String redactor = "test_redactor";
        Notification notification1 = Notification.builder()
                .id(1L)
                .postId(1L)
                .message("Notification 1")
                .redactor(redactor)
                .build();

        Notification notification2 = Notification.builder()
                .id(2L)
                .postId(2L)
                .message("Notification 2")
                .redactor(redactor)
                .build();

        when(notificationRepository.findByRedactor(redactor)).thenReturn(Arrays.asList(notification1, notification2));

        // Act
        List<NotificationResponse> responses = notificationService.getNotificationsByRedactor(redactor);

        // Assert
        verify(notificationRepository, times(1)).findByRedactor(redactor);
        assertEquals(2, responses.size());

        NotificationResponse response1 = responses.get(0);
        assertEquals(1L, response1.getId());
        assertEquals("Notification 1", response1.getMessage());
        assertEquals(1L, response1.getPostId());
        assertEquals(redactor, response1.getRedactor());

        NotificationResponse response2 = responses.get(1);
        assertEquals(2L, response2.getId());
        assertEquals("Notification 2", response2.getMessage());
        assertEquals(2L, response2.getPostId());
        assertEquals(redactor, response2.getRedactor());
    }

    @Test
    public void testDeleteNotification_Success() {
        // Arrange
        Long notificationId = 1L;
        doNothing().when(notificationRepository).deleteById(notificationId);

        // Act
        notificationService.deleteNotification(notificationId);

        // Assert
        verify(notificationRepository, times(1)).deleteById(notificationId);
    }

    @Test
    public void testDeleteNotification_NotFound() {
        // Arrange
        Long notificationId = 1L;
        doThrow(new RuntimeException("Notification not found")).when(notificationRepository).deleteById(notificationId);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            notificationService.deleteNotification(notificationId);
        });

        assertEquals("Notification not found", exception.getMessage());
        verify(notificationRepository, times(1)).deleteById(notificationId);
    }
}
