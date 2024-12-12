import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { AuthService } from '../authService/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:8083/comment';

  constructor(private http: HttpClient, private authService: AuthService) {}
  
  private getHeaders(contentType: string = 'application/json'): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role ||'',
      'Content-Type': contentType,
    });
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}`, {
      headers: this.getHeaders(),
    });
  }

  addComment(postId: number, comment: Comment): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}`, comment, {
      headers: this.getHeaders(),
    });
  }

  editComment(commentId: number, comment: Comment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${commentId}`, comment, {
      headers: this.getHeaders(),
    });
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`, {
      headers: this.getHeaders(),
    });
  }

}
