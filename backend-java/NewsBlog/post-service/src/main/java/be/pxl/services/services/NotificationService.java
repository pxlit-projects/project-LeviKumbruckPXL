package be.pxl.services.services;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.domain.Post;
import be.pxl.services.repository.NotificationRepository;
import be.pxl.services.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService implements INotificationService {

    private final PostRepository postRepository;

    private final NotificationRepository notificationRepository;

    //US-8: notificatie
    @Override
    public void sendNotification(Notification notification) {
        Post post = postRepository.findById(notification.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        notification.setRedactor(post.getRedactor());

        notificationRepository.save(notification);
        System.out.println("Notification ontvangen: " + notification.getMessage());
    }

    @Override
    public List<NotificationResponse> getNotificationsByRedactor(String redactor) {
        List<Notification> notifications = notificationRepository.findByRedactor(redactor);

        return notifications.stream().map(this::mapToNotificationResponse).toList();
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    //private methods
    private NotificationResponse mapToNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .postId(notification.getPostId())
                .redactor(notification.getRedactor())
                .build();
    }
}