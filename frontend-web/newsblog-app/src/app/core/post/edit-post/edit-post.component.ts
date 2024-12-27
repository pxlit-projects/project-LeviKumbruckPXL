import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from '../../../shared/models/post.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-post.component.html',
  styleUrl: './edit-post.component.css'
})
export class EditPostComponent {
  @Input() post!: Post; 
  @Output() save = new EventEmitter<Post>(); 
  @Output() cancelEdit = new EventEmitter<void>(); 

  onSave(): void {
    this.save.emit(this.post); 
  }

  onCancel(): void {
    this.cancelEdit.emit(); 
  }
}
