import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(contentType = 'application/json'): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role || '',
      'Content-Type': contentType,
    });
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.commentUrl}/${postId}`, {
      headers: this.getHeaders(),
    }).pipe(
      tap((comments) => console.log(`Fetched comments for post ${postId}:`, comments)),
      map((comments) =>
        comments.sort((a, b) => {
          const dateA = new Date(a.createdDate || 0).getTime();
          const dateB = new Date(b.createdDate || 0).getTime();
          return dateB - dateA; // nieuwste eerst
        })
      ),
      tap((sortedComments) => console.log(`Sorted comments for post ${postId}:`, sortedComments)),
      catchError(this.handleError)
    );
  }

  addComment(postId: number, comment: Comment): Observable<void> {
    return this.http.post<void>(`${environment.commentUrl}/${postId}`, comment, {
      headers: this.getHeaders(),
    });
  }

  editComment(commentId: number, comment: Comment): Observable<void> {
    return this.http.put<void>(`${environment.commentUrl}/${commentId}`, comment, {
      headers: this.getHeaders(),
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.commentUrl}/${commentId}`, {
      headers: this.getHeaders(),
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

}
