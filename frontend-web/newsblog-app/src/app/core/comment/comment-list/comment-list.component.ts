import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../shared/services/commentService/comment.service';
import { Comment } from '../../../shared/models/comment.model';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { AddCommentComponent } from '../add-comment/add-comment.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentItemComponent, AddCommentComponent, MatIconModule],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css'],
})
export class CommentListComponent implements OnInit {
  postId!: number;
  comments: Comment[] = [];
  editingCommentId: number | null = null;
  editedCommentContent = '';
  errorMessage = '';
  currentUser: string | null = null;

  router: Router = inject(Router);
  commentService: CommentService = inject(CommentService);
  route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['postId'];
      if (id) {
        this.postId = id;
        this.fetchComments();
      } else {
        this.errorMessage = 'Invalid post ID.';
      }
    });

    const user = sessionStorage.getItem('user');
    this.currentUser = user ? JSON.parse(user).username : null;
  }

  fetchComments(): void {
    this.commentService.getCommentsByPostId(this.postId).subscribe({
      next: (data) => {
        this.comments = data;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch comments. Please try again later.';
        console.error('Error fetching comments:', error);
      }
    });
  }

  addComment(content: string): void {
    if (!content.trim()) {
      this.errorMessage = 'Comment content cannot be empty.';
      return;
    }

    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in to add a comment.';
      return;
    }

    const comment: Comment = {
      postId: this.postId,
      user: this.currentUser,
      content: content.trim(),
    };

    this.commentService.addComment(this.postId, comment).subscribe({
      next: () => {
        this.fetchComments();
        this.errorMessage = '';
        console.log('Comment added successfully');
      },
      error: (error) => {
        this.errorMessage = 'Failed to add comment. Please try again.';
        console.error('Error adding comment:', error);
      }
    });
  }

  startEditing(comment: Comment): void {
    this.editingCommentId = comment.id!;
    this.editedCommentContent = comment.content;
    console.log(`Started editing comment with ID: ${comment.id}`);
  }

  cancelEditing(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
    this.errorMessage = '';
    console.log('Cancelled editing');
  }

  saveEditedComment(commentId: number, editedContent: string): void {
    console.log('Saving edited comment:', commentId);
    if (!editedContent.trim()) {
      this.errorMessage = 'Comment content cannot be empty.';
      return;
    }

    const existingComment = this.comments.find(c => c.id === commentId);
    if (!existingComment) {
      this.errorMessage = 'Comment not found.';
      return;
    }

    const updatedComment: Comment = {
      id: commentId,
      postId: existingComment.postId,
      user: existingComment.user,
      content: editedContent.trim(),
    };

    this.commentService.editComment(commentId, updatedComment).subscribe({
      next: () => {
        this.editingCommentId = null;
        this.editedCommentContent = '';
        this.errorMessage = '';
        this.fetchComments();
        console.log(`Comment with ID: ${commentId} edited successfully`);
      },
      error: (error) => {
        this.errorMessage = 'Failed to edit comment. Please try again.';
        console.error('Error editing comment:', error);
      }
    });
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.fetchComments();
          this.errorMessage = '';
          console.log(`Comment with ID: ${commentId} deleted successfully`);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete comment. Please try again.';
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/posts']);
    console.log('Navigated back to posts');
  }
}
