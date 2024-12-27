import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review.model';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role || '',
      'Content-Type': 'application/json',
    });
  }

  getAllReviews (): Observable<Review[]> {
    return this.http.get<Review[]>(`${environment.reviewUrl}/viewSubmittedPosts`, {
      headers: this.getHeaders(),
    });  }

  approvePost(postId: string): Observable<void> {
    return this.http.put<void>(`${environment.reviewUrl}/approve/${postId}`, {}, {
      headers: this.getHeaders(),
    });  }
  
  rejectPost(postId: string, comment: string): Observable<void> {
    return this.http.put<void>(`${environment.reviewUrl}/reject/${postId}`, comment, {
      headers: this.getHeaders(),
    });
  }
  
}