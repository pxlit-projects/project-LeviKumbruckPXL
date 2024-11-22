import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:8083/post';

  constructor(private http: HttpClient) {}

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/publish`, post);
  }

  publishDraft(draftId: number): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/publishDraft/${draftId}`, {});
  }
  
  saveAsDraft(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/saveAsDraft`, post);
  }

  updatePost(postId: number, updatedPost: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/updatePost/${postId}`, updatedPost);
  }
  
  updateDraft(id: number, post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/updateDraft/${id}`, post);
  }
  
  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/getAll`);
  }

  getDraftsByRedactor(redactor: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/drafts?redactor=${redactor}`);
  }

  filterPosts(content: string, redactor: string, date: string): Observable<Post[]> {
    const params: any = {};
  
    if (content) params.content = content;
    if (redactor) params.redactor = redactor;
    if (date) params.date = date;
  
    return this.http.get<Post[]>(`${this.apiUrl}/filter`, { params });
  }
  
  



}
