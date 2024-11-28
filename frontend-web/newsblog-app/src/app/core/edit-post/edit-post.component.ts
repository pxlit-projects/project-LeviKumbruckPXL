import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Post } from '../../shared/models/post.model';
import { Router } from '@angular/router';
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
  @Output() cancel = new EventEmitter<void>(); 

  onSave(): void {
    this.save.emit(this.post); 
  }

  onCancel(): void {
    this.cancel.emit(); 
  }
}
