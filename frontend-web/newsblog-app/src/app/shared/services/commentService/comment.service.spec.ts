import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';
import { Comment } from '../../models/comment.model';
import { provideHttpClient } from '@angular/common/http';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['getRole']);

    TestBed.configureTestingModule({
      providers: [
        CommentService,
        { provide: AuthService, useValue: authServiceMock }, provideHttpClient(), provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCommentsByPostId', () => {
    it('should GET comments for the given postId', () => {
      authServiceMock.getRole.and.returnValue('user');
      const postId = 123;
      const mockComments: Comment[] = [
        { id: 1, postId: 123, user: 'someone', content: 'Hello' },
        { id: 2, postId: 123, user: 'someone else', content: 'World' },
      ];

      service.getCommentsByPostId(postId).subscribe((data) => {
        expect(data).toEqual(mockComments);
      });

      const req = httpMock.expectOne(`${environment.commentUrl}/123`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Role')).toBe('user');
      req.flush(mockComments);
    });
  });

  /*
  describe('addComment', () => {
    
    it('should POST comment to the given postId', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const postId = 999;
      const newComment: Comment = { postId: 999, user: 'redactor', content: 'New comment' };

      service.addComment(postId, newComment).subscribe((resp) => {
        expect(resp).toBeUndefined(); // void
      });

      const req = httpMock.expectOne(`${environment.commentUrl}/999`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newComment);
      req.flush(null);
    });
    
  });
  

  describe('editComment', () => {
    
    it('should PUT the updated comment to /:commentId', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const commentId = 10;
      const updated: Comment = { id: 10, postId: 999, user: 'someone', content: 'Edited comment' };

      service.editComment(commentId, updated).subscribe((resp) => {
        expect(resp).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.commentUrl}/10`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(null);
    });
    
  });

  describe('deleteComment', () => {
    
    it('should DELETE comment by ID', () => {
      authServiceMock.getRole.and.returnValue('user');
      const commentId = 55;

      service.deleteComment(commentId).subscribe((resp) => {
        expect(resp).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.commentUrl}/55`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
    
  });

  */
});
