import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../shared/services/commentService/comment.service';
import { Comment } from '../../shared/models/comment.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-comments',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './post-comments.component.html',
  styleUrls: ['./post-comments.component.css'],
})
export class PostCommentsComponent implements OnInit {
  @Input() postId!: number;
  comments: Comment[] = [];
  newCommentContent: string = '';
  editingComment: Comment | null = null;
  loggedInUser: string | null = null;
  errorMessage: string = '';

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loggedInUser = sessionStorage.getItem('user')
      ? JSON.parse(sessionStorage.getItem('user')!).username
      : null;
    this.fetchComments();
  }

  fetchComments(): void {
    this.commentService.getCommentsByPostId(this.postId).subscribe(
      (data) => {
        this.comments = data;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch comments. Please try again later.';
        console.error('Error fetching comments:', error);
      }
    );
  }

  addComment(): void {
    if (!this.newCommentContent.trim()) return;
    const newComment: Comment = {
      content: this.newCommentContent,
      user: this.loggedInUser!,
      postId: this.postId.toString(),
    };

    this.commentService.addComment(this.postId, newComment).subscribe(
      () => {
        this.fetchComments();
        this.newCommentContent = '';
      },
      (error) => {
        console.error('Failed to add comment:', error);
      }
    );
  }

  editComment(comment: Comment): void {
    this.editingComment = { ...comment };
  }

  saveEdit(): void {
    if (this.editingComment) {
      this.commentService
        .editComment(Number(this.editingComment.id!), this.editingComment)
        .subscribe(
          () => {
            this.fetchComments();
            this.editingComment = null;
          },
          (error) => {
            console.error('Failed to edit comment:', error);
          }
        );
    }
  }

  cancelEdit(): void {
    this.editingComment = null;
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(
      () => {
        this.fetchComments();
      },
      (error) => {
        console.error('Failed to delete comment:', error);
      }
    );
  }
}
