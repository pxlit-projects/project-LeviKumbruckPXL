import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:8083/post/notification'; 

  constructor(private http: HttpClient) {}


  getNotifications(redactor: string): Observable<Notification[]> {
    const params = new HttpParams().set('redactor', redactor);
    return this.http.get<Notification[]>(this.apiUrl, { params });
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
