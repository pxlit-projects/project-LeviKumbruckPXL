import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../../shared/models/post.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-item.component.html',
  styleUrls: ['./post-item.component.css'],
})
export class PostItemComponent {
  @Input() post!: Post;
  @Input() userRole: string | null = null;
  @Output() edit = new EventEmitter<Post>();
  @Output() viewComments = new EventEmitter<number>();

  onEdit(): void {
    this.edit.emit(this.post);
  }

  onViewComments(): void {
    this.viewComments.emit(Number(this.post.id));
  }
}
