import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../../models/post.model';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const role = this.authService.getRole();
    return new HttpHeaders({
      Role: role || '',
      'Content-Type': 'application/json',
    });
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${environment.postUrl}/sendForReview`, post, {
      headers: this.getHeaders(),
    });
  }

  sendDraftForReview(draftId: number): Observable<Post> {
    return this.http.put<Post>(`${environment.postUrl}/sendDraftForReview/${draftId}`, {}, {
      headers: this.getHeaders(),
    });
  }
  
  saveAsDraft(post: Post): Observable<Post> {
    return this.http.post<Post>(`${environment.postUrl}/saveAsDraft`, post, {
      headers: this.getHeaders(),
    });
  }

  updatePost(postId: number, updatedPost: Post): Observable<Post> {
    return this.http.put<Post>(`${environment.postUrl}/updatePost/${postId}`, updatedPost, {
      headers: this.getHeaders(),
    });
  }
  
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.postUrl}/getAll`, {
      headers: this.getHeaders(),
    });
  }

  getDraftsByRedactor(redactor: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.postUrl}/drafts`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('redactor', redactor),
    });
  }

  filterPosts(content: string, redactor: string, date: string): Observable<Post[]> {
    let params = new HttpParams();
  
    if (content) params = params.set('content', content);
    if (redactor) params = params.set('redactor', redactor);
    if (date) params = params.set('date', date);
  
    return this.http.get<Post[]>(`${environment.postUrl}/filter`, { 
      headers: this.getHeaders(),
      params 
    });
  }

  getNeedsChangingPosts(redactor: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.postUrl}/needs-changing`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('redactor', redactor),
    });
  }
}