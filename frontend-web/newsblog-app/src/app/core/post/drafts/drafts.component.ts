import { Component, inject, OnInit } from '@angular/core';
import { Post } from '../../../shared/models/post.model';
import { PostService } from '../../../shared/services/postService/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditDraftComponent } from "../edit-draft/edit-draft.component";

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [FormsModule, CommonModule, EditDraftComponent],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.css'
})

export class DraftsComponent implements OnInit {
  drafts: Post[] = [];
  selectedDraft: Post | null = null;
  errorMessage = '';

  postService: PostService = inject(PostService);

  ngOnInit(): void {
    this.fetchDrafts();
  }

  fetchDrafts(): void {
    const user = sessionStorage.getItem('user');
    const redactor = user ? JSON.parse(user).username : '';

    this.postService.getDraftsByRedactor(redactor).subscribe({
      next: (data) => {
        this.drafts = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch drafts. Please try again later.';
        console.error(error);
      }
    });
  }

  editDraft(draft: Post): void {
    this.selectedDraft = draft; 
  }

  cancelEdit(): void {
    this.selectedDraft = null; 
  }

  updateDraftList(updatedDraft: Post): void {
    this.drafts = this.drafts.map((draft) =>
      draft.id === updatedDraft.id ? updatedDraft : draft
    );
    this.selectedDraft = null; 
  }

  sendDraftForReview(draft: Post): void {
    this.postService.sendDraftForReview(Number(draft.id!)).subscribe({
      next: (publishedPost) => {
        this.drafts = this.drafts.filter((d) => d.id !== draft.id); 
        this.errorMessage = '';
        console.log('Draft published successfully:', publishedPost);
      },
      error: (error) => {
        this.errorMessage = 'Failed to publish draft. Please try again later.';
        console.error('Error publishing draft:', error);
      }
    });
  }
}