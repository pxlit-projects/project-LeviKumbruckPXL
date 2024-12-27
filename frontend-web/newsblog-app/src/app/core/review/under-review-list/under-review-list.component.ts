import { Component, inject, OnInit } from '@angular/core';
import { ReviewService } from '../../../shared/services/reviewService/review.service';
import { Review } from '../../../shared/models/review.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnderReviewItemComponent } from '../under-review-item/under-review-item.component';

@Component({
  selector: 'app-under-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UnderReviewItemComponent],
  templateUrl: './under-review-list.component.html',
  styleUrls: ['./under-review-list.component.css'],
})
export class UnderReviewListComponent implements OnInit {
  reviews: Review[] = [];
  userRole: string | null = null;
  errorMessage = '';

  reviewService: ReviewService = inject(ReviewService);

  ngOnInit(): void {
    this.fetchReviews();

    const user = sessionStorage.getItem('user');
    this.userRole = user ? JSON.parse(user).role : null;
  }

  fetchReviews(): void {
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch reviews. Please try again later.';
        console.error('Error fetching reviews:', error);
      }
    });
  }

  approvePost(postId: string): void {
    this.reviewService.approvePost(postId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((review) => review.postId !== postId);
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error approving post:', error);
        this.errorMessage = 'Failed to approve post.';
      }
    });
  }

  rejectPost(postId: string, comment: string): void {
    this.reviewService.rejectPost(postId, comment).subscribe({
      next: () => {
        this.reviews = this.reviews.filter((review) => review.postId !== postId);
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error rejecting post:', error);
        this.errorMessage = 'Failed to reject post.';
      }
    });
  }
}
