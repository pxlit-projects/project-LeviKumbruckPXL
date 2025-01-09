import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentListComponent } from './comment-list.component';
import { CommentService } from '../../../shared/services/commentService/comment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Comment } from '../../../shared/models/comment.model';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;

  let commentServiceMock: jasmine.SpyObj<CommentService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: Partial<ActivatedRoute>;

  const mockComments: Comment[] = [
    { id: 1, postId: 123, user: 'userA', content: 'First comment', createdDate: '2025-01-01T10:00:00Z' },
    { id: 2, postId: 123, user: 'userB', content: 'Second comment', createdDate: '2025-01-02T09:30:00Z' },
  ];

  beforeEach(async () => {
    commentServiceMock = jasmine.createSpyObj<CommentService>('CommentService', [
      'getCommentsByPostId',
      'addComment',
      'editComment',
      'deleteComment'
    ]);

    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    activatedRouteMock = {
      params: of({ postId: '123' }) 
    };

    await TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [
        { provide: CommentService, useValue: commentServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    beforeEach(() => {
      const user = { username: 'mockUser' };
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(user));
    });

    it('should create', () => {
      commentServiceMock.getCommentsByPostId.and.returnValue(of(mockComments));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component).toBeTruthy();
    });

    it('should set postId from route and call fetchComments', () => {
      commentServiceMock.getCommentsByPostId.and.returnValue(of([]));
      spyOn(component, 'fetchComments').and.callThrough();

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.postId).toBe(123);
      expect(component.fetchComments).toHaveBeenCalled();
    });

    it('should set currentUser from sessionStorage', () => {
      commentServiceMock.getCommentsByPostId.and.returnValue(of([]));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.currentUser).toBe('mockUser');
    });
  });

  describe('fetchComments', () => {
    beforeEach(() => {
      component.postId = 123;
    });

    it('should load comments on success and clear errorMessage', () => {
      commentServiceMock.getCommentsByPostId.and.returnValue(of(mockComments));
      fixture.detectChanges(); 

      expect(commentServiceMock.getCommentsByPostId).toHaveBeenCalledWith(123);
      expect(component.comments).toEqual(mockComments);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      commentServiceMock.getCommentsByPostId.and.returnValue(
        throwError(() => new Error('Fetch Error'))
      );
      fixture.detectChanges(); // triggert fetchComments in ngOnInit

      expect(commentServiceMock.getCommentsByPostId).toHaveBeenCalled();
      expect(component.comments).toEqual([]);
      expect(component.errorMessage).toBe('Failed to fetch comments. Please try again later.');
    });
  });

  describe('addComment', () => {
    beforeEach(() => {
      component.postId = 123;
      component.currentUser = 'mockUser';
    });

    it('should do nothing if content is empty/blank', () => {
      component.addComment('   '); 
      expect(commentServiceMock.addComment).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Comment content cannot be empty.');
    });

    it('should do nothing if currentUser is null', () => {
      component.currentUser = null;
      component.addComment('Some comment');
      expect(commentServiceMock.addComment).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('You must be logged in to add a comment.');
    });

    it('should call commentService.addComment with trimmed content on success', () => {
      commentServiceMock.addComment.and.returnValue(of(undefined));
      spyOn(component, 'fetchComments');

      component.addComment('   Valid comment   ');
      expect(commentServiceMock.addComment).toHaveBeenCalledWith(123, {
        postId: 123,
        user: 'mockUser',
        content: 'Valid comment'
      });
      expect(component.errorMessage).toBe('');
      expect(component.fetchComments).toHaveBeenCalled();
    });

    it('should set errorMessage on error', () => {
      commentServiceMock.addComment.and.returnValue(
        throwError(() => new Error('Add error'))
      );

      component.addComment('Another comment');
      expect(component.errorMessage).toBe('Failed to add comment. Please try again.');
    });
  });

  describe('startEditing', () => {
    it('should set editingCommentId and editedCommentContent', () => {
      const testComment: Comment = { id: 10, postId: 123, user: 'userA', content: 'content' };
      component.startEditing(testComment);
      expect(component.editingCommentId).toBe(10);
      expect(component.editedCommentContent).toBe('content');
    });
  });

  describe('cancelEditing', () => {
    it('should reset editingCommentId, editedCommentContent, and errorMessage', () => {
      component.editingCommentId = 5;
      component.editedCommentContent = 'some text';
      component.errorMessage = 'some error';

      component.cancelEditing();
      expect(component.editingCommentId).toBeNull();
      expect(component.editedCommentContent).toBe('');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('saveEditedComment', () => {
    beforeEach(() => {
      component.comments = [...mockComments];
      component.editingCommentId = 1; 
    });

    it('should not save if editedContent is blank', () => {
      component.saveEditedComment(1, '   ');
      expect(commentServiceMock.editComment).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Comment content cannot be empty.');
    });

    it('should set error if no matching comment is found', () => {
      component.saveEditedComment(999, 'Some content');
      expect(commentServiceMock.editComment).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('Comment not found.');
    });

    it('should call commentService.editComment and refetchComments on success', () => {
      const updatedContent = 'Updated content';
      commentServiceMock.editComment.and.returnValue(of(undefined));
      spyOn(component, 'fetchComments');

      component.saveEditedComment(1, updatedContent);
      expect(commentServiceMock.editComment).toHaveBeenCalledWith(1, {
        id: 1,
        postId: 123,
        user: 'userA',
        content: 'Updated content',
      });
      expect(component.fetchComments).toHaveBeenCalled();
      expect(component.editingCommentId).toBeNull();
      expect(component.editedCommentContent).toBe('');
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      commentServiceMock.editComment.and.returnValue(
        throwError(() => new Error('edit error'))
      );
      spyOn(component, 'fetchComments');

      component.saveEditedComment(1, 'Edited Content');
      expect(component.errorMessage).toBe('Failed to edit comment. Please try again.');
      expect(component.fetchComments).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    beforeEach(() => {
      component.comments = [...mockComments];
    });

    it('should call commentService.deleteComment on confirm', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      commentServiceMock.deleteComment.and.returnValue(of(undefined));
      spyOn(component, 'fetchComments');

      component.deleteComment(1);
      expect(commentServiceMock.deleteComment).toHaveBeenCalledWith(1);
      expect(component.fetchComments).toHaveBeenCalled();
      expect(component.errorMessage).toBe('');
    });

    it('should not delete if confirm is cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteComment(1);
      expect(commentServiceMock.deleteComment).not.toHaveBeenCalled();
    });

    it('should set errorMessage on error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      commentServiceMock.deleteComment.and.returnValue(
        throwError(() => new Error('delete error'))
      );

      component.deleteComment(2);
      expect(component.errorMessage).toBe('Failed to delete comment. Please try again.');
    });
  });

  describe('goBack', () => {
    it('should navigate back to /posts', () => {
      component.goBack();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });
});
