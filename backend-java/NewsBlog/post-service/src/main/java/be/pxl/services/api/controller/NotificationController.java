package be.pxl.services.api.controller;

import be.pxl.services.api.dto.NotificationResponse;
import be.pxl.services.domain.Notification;
import be.pxl.services.services.INotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public List<NotificationResponse> getNotificationsOfRedactor(@RequestHeader("Role") String role, @RequestParam String redactor) {
        log.info("Received request to get notifications of redactor: {}", redactor);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to get notifications for redactor {}", role, redactor);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return notificationService.getNotificationsByRedactor(redactor);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@RequestHeader("Role") String role, @PathVariable Long id) {
        log.info("Received request to delete notification with id: {}", id);

        if (!role.equals("redactor")) {
            log.warn("Forbidden: User with role {} attempted to delete notification with id {}", role, id);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        notificationService.deleteNotification(id);
    }
}