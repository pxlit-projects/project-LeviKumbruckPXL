import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Notification } from '../../models/notification.model';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  // moet dit hier zo doen want anders is redactor null voor een reden.
  private getHeaders(contentType = 'application/json'): HttpHeaders {
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
    return this.http.get<Notification[]>(environment.notificationUrl, { 
      headers: this.getHeaders(),
      params,
    }).pipe(
      tap((notifications) => console.log('Fetched notifications:', notifications)),
      catchError(this.handleError)
    );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.notificationUrl}/${id}`, {
      headers: this.getHeaders(),
    }).pipe(
      tap(() => console.log(`Deleted notification with ID: ${id}`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
