import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PostService {
  private apiUrl = 'http://localhost:8083/posts'; 

  constructor(private http: HttpClient) {}

  createPost(post: { title: string; content: string; author: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, post);
  }
}