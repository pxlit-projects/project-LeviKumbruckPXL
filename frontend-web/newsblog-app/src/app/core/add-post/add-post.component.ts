import { Component, OnInit } from '@angular/core';
import { PostService } from '../../shared/services/postService/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Post } from '../../shared/models/post.model';
import { DraftsComponent } from "../drafts/drafts.component";

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [FormsModule, CommonModule, DraftsComponent],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})


export class AddPostComponent {
  newPost: Post = {
    title: '',
    content: '',
    redactor: (() => {
      const user = sessionStorage.getItem('user');
      if (user) {
        return JSON.parse(user).username;
      }
      return '';
    })()
    
  };
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private postService: PostService) {}

  submitPost(): void {
    this.postService.createPost(this.newPost).subscribe(
      (response) => {
        this.successMessage = 'Post created successfully!';
        this.errorMessage = '';
        this.newPost = { title: '', content: '', redactor: ''};
      },
      (error) => {
        this.errorMessage = 'Failed to create post.';
        this.successMessage = '';
      }
    );
  }

  saveAsDraft(): void {
    this.postService.saveAsDraft(this.newPost).subscribe(
      (response) => {
        this.successMessage = 'Post saved as draft successfully!';
        this.errorMessage = '';
        this.resetForm();
      },
      (error) => {
        this.errorMessage = 'Failed to save post as draft.';
        this.successMessage = '';
      }
    );
  }

  private resetForm(): void {
    window.location.reload();
  }

}
