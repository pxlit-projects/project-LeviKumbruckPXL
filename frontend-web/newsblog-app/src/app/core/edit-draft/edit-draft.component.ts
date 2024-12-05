import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../../shared/models/post.model';
import { PostService } from '../../shared/services/postService/post.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-draft',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-draft.component.html',
  styleUrl: './edit-draft.component.css'
})

export class EditDraftComponent {
  @Input() draft!: Post; 
  @Output() cancelEdit = new EventEmitter<void>(); 
  @Output() draftUpdated = new EventEmitter<Post>(); 

  constructor(private postService: PostService) {}

  saveDraft(): void {
    this.postService.updatePost(Number(this.draft.id!), this.draft).subscribe(
      (updatedDraft) => {
        this.draftUpdated.emit(updatedDraft); 
      },
      (error) => {
        console.error('Failed to save draft', error);
      }
    );
  }

  cancel(): void {
    this.cancelEdit.emit();
  }
}