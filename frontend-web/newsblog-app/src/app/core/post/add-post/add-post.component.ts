import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../../shared/services/postService/post.service';
import { Post } from '../../../shared/models/post.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DraftsComponent } from '../drafts/drafts.component';
import { NeedsChangingComponent } from '../needs-changing/needs-changing.component';
import { EditDraftComponent } from '../edit-draft/edit-draft.component';

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DraftsComponent,
    NeedsChangingComponent,
    EditDraftComponent
  ],
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css']
})


export class AddPostComponent implements OnInit {
  postForm!: FormGroup;
  successMessage = '';
  errorMessage = '';
  selectedPost: Post | null = null;

  fb: FormBuilder = inject(FormBuilder);
  postService: PostService = inject(PostService);
  router: Router = inject(Router);

  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
    const redactorUsername = user ? JSON.parse(user).username : '';

    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      redactor: [{ value: redactorUsername, disabled: true }, Validators.required]
    });
  }

  submitPost(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const newPost: Post = {
      title: this.postForm.get('title')?.value,
      content: this.postForm.get('content')?.value,
      redactor: this.postForm.get('redactor')?.value
    };

    this.postService.createPost(newPost).subscribe({
      next: () => {
        this.successMessage = 'Post created successfully!';
        this.errorMessage = '';
        this.postForm.reset({
          redactor: newPost.redactor 
        });
      },
      error: () => {
        this.errorMessage = 'Failed to create post.';
        this.successMessage = '';
      }
    });
  }

  saveAsDraft(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }

    const draftPost: Post = {
      title: this.postForm.get('title')?.value,
      content: this.postForm.get('content')?.value,
      redactor: this.postForm.get('redactor')?.value
    };

    this.postService.saveAsDraft(draftPost).subscribe({
      next: () => {
        this.successMessage = 'Post saved as draft successfully!';
        this.errorMessage = '';
        this.postForm.reset({
          redactor: draftPost.redactor 
        });

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: () => {
        this.errorMessage = 'Failed to save post as draft.';
        this.successMessage = '';
      }
    });
  }

  cancelEdit(): void {
    this.selectedPost = null;
  }
}
