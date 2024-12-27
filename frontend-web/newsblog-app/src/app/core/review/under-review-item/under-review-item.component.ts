import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Review } from '../../../shared/models/review.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-under-review-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './under-review-item.component.html',
  styleUrls: ['./under-review-item.component.css'],
})
export class UnderReviewItemComponent {
  @Input() review!: Review;
  @Input() userRole: string | null = null;
  
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<{ postId: string; comment: string }>();

  rejectionComment ='';

  onApprove(): void {
    this.approve.emit(this.review.postId);
  }

  onReject(): void {
    this.reject.emit({ postId: this.review.postId, comment: this.rejectionComment });
  }
}
