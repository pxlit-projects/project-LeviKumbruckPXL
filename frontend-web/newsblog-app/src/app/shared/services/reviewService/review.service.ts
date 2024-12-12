import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review.model';
import { AuthService } from '../authService/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:8083/review';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role || '',
      'Content-Type': 'application/json',
    });
  }



  getAllReviews (): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/viewSubmittedPosts`, {
      headers: this.getHeaders(),
    });  }

  approvePost(postId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/approve/${postId}`, {}, {
      headers: this.getHeaders(),
    });  }
  
  rejectPost(postId: string, comment: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reject/${postId}`, comment, {
      headers: this.getHeaders(),
    });
  }
  
  
}
