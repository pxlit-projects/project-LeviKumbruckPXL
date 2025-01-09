import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
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

  getAllReviews(): Observable<Review[]> {
    return this.http
      .get<Review[]>(`${environment.reviewUrl}/viewSubmittedPosts`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((reviews) => console.log('Fetched reviews:', reviews)),
        catchError(this.handleError)
      );
  }

  approvePost(postId: string): Observable<void> {
    return this.http
      .put<void>(`${environment.reviewUrl}/approve/${postId}`, {}, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap(() => console.log(`Post approved: ${postId}`)),
        catchError(this.handleError)
      );
  }
  
  rejectPost(postId: string, comment: string): Observable<void> {
    return this.http.put<void>(`${environment.reviewUrl}/reject/${postId}`, comment, {
      headers: this.getHeaders(),
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
  
}