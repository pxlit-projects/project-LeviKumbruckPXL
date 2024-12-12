package be.pxl.services.api.controller;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.services.INotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification")
public class NotificationController {

    private final INotificationService notificationService;

    public NotificationController(INotificationService notificationService) {
        this.notificationService = notificationService;
    }

    //US-8: Notificatie
    @PostMapping()
    public void sendNotification(@RequestBody Notification notification) {
        notificationService.sendNotification(notification);
    }

    @GetMapping()
    public List<NotificationResponse> getNotificationsOfRedactor(@RequestParam String redactor) {
        return notificationService.getNotificationsByRedactor(redactor);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}