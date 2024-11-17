import { Component } from '@angular/core';
import { PostService } from '../../shared/services/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  
  newPost = {
    title: '',
    content: '',
    author: '',
  };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private postService: PostService) {}

  submitPost(): void {
    this.postService.createPost(this.newPost).subscribe(
      (response) => {
        this.successMessage = 'Post created successfully!';
        this.errorMessage = '';
        this.newPost = { title: '', content: '', author: '' }; 
      },
      (error) => {
        this.errorMessage = 'Failed to create post.';
        this.successMessage = '';
      }
    );
  }
}
