package be.pxl.services.services;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;

import java.util.List;

public interface INotificationService {

    void sendNotification(Notification notification);

    List<NotificationResponse> getNotificationsByRedactor(String redactor);

    void deleteNotification(Long notificationId);
}
