package be.pxl.services.api.controller;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.services.INotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    private final INotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    public NotificationController(INotificationService notificationService) {
        this.notificationService = notificationService;
    }

    //US-8: Notificatie
    @PostMapping()
    public void sendNotification(@RequestBody Notification notification) {
        log.info("Received request to send a notification");
        notificationService.sendNotification(notification);
    }

    @GetMapping()
    public List<NotificationResponse> getNotificationsOfRedactor(@RequestParam String redactor) {
        log.info("Received request to get notifications of redactor: {}", redactor);
        return notificationService.getNotificationsByRedactor(redactor);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        log.info("Received request to delete notification with id: {}", id);
        notificationService.deleteNotification(id);
    }
}