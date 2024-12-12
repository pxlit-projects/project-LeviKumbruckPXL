import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../models/notification.model';
import { AuthService } from '../authService/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:8083/post/notification'; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  // moet dit hier zo doen want anders is redactor null voor een reden.
  private getHeaders(contentType: string = 'application/json'): HttpHeaders {
    let role = '';
    const userString = sessionStorage.getItem('user');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        role = user.role || '';
        console.log(`NotificationService: Retrieved role '${role}' from sessionStorage`);
      } catch (error) {
        console.error('NotificationService: Failed to parse user from sessionStorage', error);
      }
    } else {
      console.warn('NotificationService: No user data found in sessionStorage');
    }

    return new HttpHeaders({
      Role: role,
      'Content-Type': contentType,
    });
  }

  getNotifications(redactor: string): Observable<Notification[]> {
    const params = new HttpParams().set('redactor', redactor);
    return this.http.get<Notification[]>(this.apiUrl, { 
      headers: this.getHeaders(),
      params,
    });
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
