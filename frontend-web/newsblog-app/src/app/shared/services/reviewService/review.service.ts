import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:8083/review';

  constructor(private http: HttpClient) {}

  getAllReviews (): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/viewSubmittedPosts`);
  }

  approvePost(postId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/approve/${postId}`, {});
  }
  
  rejectPost(postId: string, comment: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reject/${postId}`, comment, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  
  
}
