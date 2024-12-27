import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css'],
})
export class AddCommentComponent implements OnInit {
  @Output() commentAdded = new EventEmitter<string>();
  @Output() errorOccurred = new EventEmitter<string>();

  commentForm!: FormGroup;

  private fb: FormBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      const content = this.commentForm.value.content.trim();
      if (content) {
        this.commentAdded.emit(content);
        this.commentForm.reset();
      } else {
        this.errorOccurred.emit('Comment content cannot be empty.');
      }
    } else {
      this.errorOccurred.emit('Comment content cannot be empty.');
    }
  }
}
