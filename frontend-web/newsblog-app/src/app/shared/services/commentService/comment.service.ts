import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private http: HttpClient, private authService: AuthService) {}
  
  private getHeaders(contentType = 'application/json'): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role ||'',
      'Content-Type': contentType,
    });
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.commentUrl}/${postId}`, {
      headers: this.getHeaders(),
    });
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

}
