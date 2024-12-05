import { Component } from '@angular/core';
import { ReviewService } from '../../shared/services/reviewService/review.service';
import { Router } from '@angular/router';
import { Review } from '../../shared/models/review.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-under-review',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './under-review.component.html',
  styleUrls: ['./under-review.component.css'],
})
export class UnderReviewComponent {
  reviews: Review[] = [];
  userRole: string | null = null;
  errorMessage: string = '';
  rejectionComments: { [key: string]: string } = {}; // Map to store rejection comments per postId

  constructor(private reviewService: ReviewService, private router: Router) {}

  ngOnInit(): void {
    this.fetchReviews();

    const user = sessionStorage.getItem('user');
    this.userRole = user ? JSON.parse(user).role : null;
  }

  fetchReviews(): void {
    this.reviewService.getAllReviews().subscribe(
      (data) => {
        this.reviews = data;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch reviews. Please try again later.';
        console.error('Error fetching reviews:', error);
      }
    );
  }

  approvePost(postId: string): void {
    this.reviewService.approvePost(postId).subscribe(
      () => {
        this.reviews = this.reviews.filter((review) => review.postId !== postId);
      },
      (error) => {
        console.error('Error approving post:', error);
      }
    );
  }

  rejectPost(postId: string): void {
    const comment = this.rejectionComments[postId]?.trim();
    if (!comment) {
      alert('Please add a comment before rejecting a post.');
      return;
    }

    this.reviewService.rejectPost(postId, comment).subscribe(
      () => {
        this.reviews = this.reviews.filter((review) => review.postId !== postId);
        delete this.rejectionComments[postId]; 
      },
      (error) => {
        console.error('Error rejecting post:', error);
      }
    );
  }
}
