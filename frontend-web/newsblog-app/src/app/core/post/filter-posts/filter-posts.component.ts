import { Component, EventEmitter, inject, Output } from '@angular/core';
import { PostService } from '../../../shared/services/postService/post.service';
import { Post } from '../../../shared/models/post.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-posts.component.html',
  styleUrl: './filter-posts.component.css'
})

export class FilterPostsComponent {
  content = '';
  author = '';
  date ='';
  errorMessage = '';

  @Output() filtered = new EventEmitter<Post[]>(); 
  @Output() resetFilter = new EventEmitter<void>(); 


  postService: PostService = inject(PostService);

  applyFilters(): void {
    this.postService
      .filterPosts(this.content, this.author, this.date)
      .subscribe({
        next: (posts) => {
          this.errorMessage = '';
          this.filtered.emit(posts);
        },
        error: (error) => {
          this.errorMessage = 'Failed to filter posts. Please try again.';
          console.error(error);
        }
      });
  }

  resetFilters(): void {
    this.content = '';
    this.author = '';
    this.date = '';
    this.resetFilter.emit(); 
  }
}

