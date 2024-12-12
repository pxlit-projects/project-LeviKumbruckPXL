import { Component, OnInit } from '@angular/core';
import { PostService } from '../../shared/services/postService/post.service';
import { Post } from '../../shared/models/post.model';
import { CommonModule } from '@angular/common';
import { FilterPostsComponent } from "../filter-posts/filter-posts.component";
import { Router } from '@angular/router';
import { EditPostComponent } from '../edit-post/edit-post.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, EditPostComponent, FilterPostsComponent],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css'
})

export class PostsComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  errorMessage: string = '';
  userRole: string | null = null;
  selectedPost: Post | null = null;
  isFiltered: boolean = false; 

  constructor(private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.fetchPosts();

    const user = sessionStorage.getItem('user');
    this.userRole = user ? JSON.parse(user).role : null;
  }

  fetchPosts(): void {
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data;
        
      },
      (error) => {
        this.errorMessage = 'Failed to fetch posts. Please try again later.';
        console.error('Error fetching posts:', error);
      }
    );
  }

  onFilteredPosts(filtered: Post[]): void {
    this.filteredPosts = filtered;
    this.isFiltered = true; 
  }

  onResetFilters(): void {
    this.isFiltered = false;
    this.filteredPosts = [];
  }

  editPost(post: Post): void {
    this.selectedPost = { ...post }; 
  }

  cancelEdit(): void {
    this.selectedPost = null;
  }

  saveUpdatedPost(updatedPost: Post): void {
    this.postService.updatePost(Number(updatedPost.id), updatedPost).subscribe(
      (response) => {
        this.posts = this.posts.map((post) =>
          post.id === updatedPost.id ? response : post
        );
        this.selectedPost = null; 
      },
      (error) => {
        console.error('Failed to update post:', error);
        this.errorMessage = 'Failed to update post. Please try again later.';
      }
    );
  }

  viewComments(postId: number): void {
    this.router.navigate(['/posts', postId, 'comments']);
  }
}
