import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../shared/services/commentService/comment.service';
import { Comment } from '../../shared/models/comment.model';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  postId!: number;
  comments: Comment[] = [];
  newCommentContent: string = '';
  editingCommentId: number | null = null; 
  editedCommentContent: string = '';
  errorMessage: string = '';
  currentUser: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('postId');
      if (id) {
        this.postId = +id;
        this.fetchComments();
      } else {
        this.errorMessage = 'Invalid post ID.';
      }
    });

    const user = sessionStorage.getItem('user');
    this.currentUser = user ? JSON.parse(user).username : null;
  }

  fetchComments(): void {
    this.commentService.getCommentsByPostId(this.postId).subscribe(
      (data) => {
        this.comments = data;
        console.log('Fetched comments:', this.comments);
      },
      (error) => {
        this.errorMessage = 'Failed to fetch comments. Please try again later.';
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment(): void {
    if (!this.newCommentContent.trim()) {
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
      content: this.newCommentContent.trim(),
    };

    this.commentService.addComment(this.postId, comment).subscribe(
      () => {
        this.newCommentContent = '';
        this.errorMessage = '';
        this.fetchComments();
        console.log('Comment added successfully'); 
      },
      (error) => {
        this.errorMessage = 'Failed to add comment. Please try again.';
        console.error('Error adding comment:', error);
      }
    );
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

  saveEditedComment(commentId: number): void { 
    if (!this.editedCommentContent.trim()) {
      this.errorMessage = 'Comment content cannot be empty.';
      return;
    }

    const existingComment = this.comments.find((c) => c.id === commentId);
    if (!existingComment) {
      this.errorMessage = 'Comment not found.';
      return;
    }

    const updatedComment: Comment = {
      id: commentId,
      postId: existingComment.postId,
      user: existingComment.user,
      content: this.editedCommentContent.trim(),
    };

    this.commentService.editComment(commentId, updatedComment).subscribe(
      () => {
        this.editingCommentId = null;
        this.editedCommentContent = '';
        this.errorMessage = '';
        this.fetchComments();
        console.log(`Comment with ID: ${commentId} edited successfully`);
      },
      (error) => {
        this.errorMessage = 'Failed to edit comment. Please try again.';
        console.error('Error editing comment:', error);
      }
    );
  }

  deleteComment(commentId: number): void { 
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe(
        () => {
          this.fetchComments();
          console.log(`Comment with ID: ${commentId} deleted successfully`); 
        },
        (error) => {
          this.errorMessage = 'Failed to delete comment. Please try again.';
          console.error('Error deleting comment:', error);
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/posts']);
    console.log('Navigated back to posts'); 
  }
}
