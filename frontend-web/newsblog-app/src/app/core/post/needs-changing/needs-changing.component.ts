import { Component, inject, OnInit } from '@angular/core';
import { Post } from '../../../shared/models/post.model';
import { PostService } from '../../../shared/services/postService/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditDraftComponent } from '../edit-draft/edit-draft.component';

@Component({
  selector: 'app-needs-changing',
  standalone: true,
  imports: [FormsModule, CommonModule, EditDraftComponent],
  templateUrl: './needs-changing.component.html',
  styleUrls: ['./needs-changing.component.css'],
})
export class NeedsChangingComponent implements OnInit {
  posts: Post[] = [];
  selectedPost: Post | null = null;
  errorMessage = '';
  redactor ='';
  postService: PostService = inject(PostService);

  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
    this.redactor = user ? JSON.parse(user).username : '';
    this.fetchNeedsChangingPosts();
  }

  fetchNeedsChangingPosts(): void {
    this.postService.getNeedsChangingPosts(this.redactor).subscribe({
      next: (data) => {
        this.posts = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch posts. Please try again later.';
        console.error('Error fetching posts:', error);
      },
    });
  }

  editPost(post: Post): void {
    this.selectedPost = post; 
  }

  cancelEdit(): void {
    window.location.reload(); 
  }

  updatePostList(updatedPost: Post): void {
    this.posts = this.posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post
    );
    this.selectedPost = null; 
  }

  resendForReview(post: Post): void {
    this.postService.sendDraftForReview(Number(post.id)).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p.id !== post.id);
        this.errorMessage = '';
        console.log('Post resent for review:', post);
      },
      error: (error) => {
        this.errorMessage = 'Failed to resend post for review.';
        console.error('Error resending post for review:', error);
      },
    });
  }
}
