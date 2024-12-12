import { Component, OnInit } from '@angular/core';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../../shared/services/notificationService/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})

export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  redactor: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.getRedactorUsername();
    this.fetchNotifications();
  }

  getRedactorUsername(): void {
    const user = sessionStorage.getItem('user');
    if (user) {
      this.redactor = JSON.parse(user).username;
    }
  }

  fetchNotifications(): void {
    if (this.redactor) {
      this.loading = true;
      this.notificationService.getNotifications(this.redactor).subscribe(
        (data) => {
          this.notifications = data;
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching notifications:', error);
          this.error = 'Failed to load notifications.';
          this.loading = false;
        }
      );
    }
  }


  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe(
      () => {
        this.notifications = this.notifications.filter((n) => n.id !== id);
      },
      (error) => {
        console.error('Error deleting notification:', error);
        this.error = 'Failed to delete notification.';
      }
    );
  }
}
