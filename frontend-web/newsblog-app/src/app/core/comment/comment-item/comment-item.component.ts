import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Comment } from '../../../shared/models/comment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css'],
})
export class CommentItemComponent {
  @Input() comment!: Comment;
  @Input() currentUser: string | null = null;
  @Input() isEditing = false;
  @Input() editedContent = '';

  @Output() startEdit = new EventEmitter<Comment>();
  @Output() delete = new EventEmitter<number>();
  @Output() saveEdit = new EventEmitter<{ id: number; content: string }>();
  @Output() cancelEdit = new EventEmitter<void>();

  onStartEdit(): void {
    this.startEdit.emit(this.comment);
  }

  onDelete(): void {
    this.delete.emit(this.comment.id!);
  }

  onSaveEdit(): void {
    console.log('this.comment.id', this.comment.id!);
    this.saveEdit.emit({ id: this.comment.id!, content: this.editedContent });
  }

  onCancelEdit(): void {
    this.cancelEdit.emit();
  }
}
