import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:8083/comment';

  constructor(private http: HttpClient) {}

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${postId}`);
  }

  addComment(postId: number, comment: Comment): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}`, comment);
  }

  editComment(commentId: number, comment: Comment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${commentId}`, comment);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}
