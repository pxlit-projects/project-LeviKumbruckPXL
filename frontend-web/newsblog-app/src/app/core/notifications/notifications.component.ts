import { Component, inject, OnInit } from '@angular/core';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../../shared/services/notificationService/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule,
MatProgressSpinnerModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})

export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  redactor = '';
  loading = false;
  error = '';
  notificationService: NotificationService = inject(NotificationService);

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
      this.notificationService.getNotifications(this.redactor).subscribe({
        next: (data) => {
          this.notifications = data;
          this.loading = false;
          this.error = '';
        },
        error: (error) => {
          this.error = 'Failed to load notifications.';
          this.loading = false;
          console.error('Error fetching notifications:', error);
        }
      });
    }
  }


  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== id);
        this.error = '';
      },
      error: (error) => {
        this.error = 'Failed to delete notification.';
        console.error('Error deleting notification:', error);
      }
    });
  }
}
