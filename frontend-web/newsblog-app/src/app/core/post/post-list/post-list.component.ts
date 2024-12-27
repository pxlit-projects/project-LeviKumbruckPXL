import { Component, inject, OnInit } from '@angular/core';
import { PostService } from '../../../shared/services/postService/post.service';
import { Post } from '../../../shared/models/post.model';
import { CommonModule } from '@angular/common';
import { FilterPostsComponent } from '../filter-posts/filter-posts.component';
import { PostItemComponent } from '../post-item/post-item.component';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    FilterPostsComponent,
    PostItemComponent,
    EditPostComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  errorMessage = '';
  userRole: string | null = null;
  selectedPost: Post | null = null;
  isFiltered = false;
  router: Router = inject(Router);
  postService: PostService = inject(PostService);

  ngOnInit(): void {
    this.fetchPosts();
    console.log('this.posts', this.posts);
    const user = sessionStorage.getItem('user');
    this.userRole = user ? JSON.parse(user).role : null;
  }

  fetchPosts(): void {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch posts. Please try again later.';
        console.error('Error fetching posts:', error);
      }
    });
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
    this.postService.updatePost(Number(updatedPost.id), updatedPost).subscribe({
      next: (response) => {
        this.posts = this.posts.map((post) =>
          post.id === updatedPost.id ? response : post
        );
        this.selectedPost = null;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Failed to update post:', error);
        this.errorMessage = 'Failed to update post. Please try again later.';
      }
    });
  }

  viewComments(postId: number): void {
    this.router.navigate(['/posts', postId, 'comments']);
  }
}
