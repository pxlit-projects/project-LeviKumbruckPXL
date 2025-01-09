import { TestBed } from '@angular/core/testing';
import { PostService } from './post.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';
import { Post } from '../../models/post.model';
import { provideHttpClient } from '@angular/common/http';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['getRole']);

    TestBed.configureTestingModule({
      providers: [
        
        PostService,
        { provide: AuthService, useValue: authServiceMock }, provideHttpClient(), provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createPost', () => {
    it('should POST a new post to /sendForReview', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const mockPost: Post = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        redactor: 'RedactorUser'
      };

      service.createPost(mockPost).subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${environment.postUrl}/sendForReview`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Role')).toBe('redactor');
      req.flush(mockPost);
    });
  });

  describe('sendDraftForReview', () => {
    it('should PUT to /sendDraftForReview/:draftId', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const draftId = 123;
      const mockPost: Post = { id: '123', title: 'Draft Title', content: '...', redactor: 'someone' };

      service.sendDraftForReview(draftId).subscribe((result) => {
        expect(result).toEqual(mockPost);
      });

      const req = httpMock.expectOne(`${environment.postUrl}/sendDraftForReview/123`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Role')).toBe('redactor');
      req.flush(mockPost);
    });
  });

  describe('saveAsDraft', () => {
    it('should POST to /saveAsDraft', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const draft: Post = { title: 'Draft', content: '...', redactor: 'me' };

      service.saveAsDraft(draft).subscribe((response) => {
        expect(response).toEqual({ ...draft, id: '999' });
      });

      const req = httpMock.expectOne(`${environment.postUrl}/saveAsDraft`);
      expect(req.request.method).toBe('POST');
      req.flush({ ...draft, id: '999' });
    });
  });

  describe('updatePost', () => {
    it('should PUT to /updatePost/:postId', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const updated: Post = { id: '10', title: 'Updated Title', content: 'Updated Content', redactor: 'someone' };

      service.updatePost(10, updated).subscribe((resp) => {
        expect(resp).toEqual(updated);
      });

      const req = httpMock.expectOne(`${environment.postUrl}/updatePost/10`);
      expect(req.request.method).toBe('PUT');
      req.flush(updated);
    });
  });

  describe('getAllPosts', () => {
    it('should GET from /getAll', () => {
      authServiceMock.getRole.and.returnValue('user');
      const mockPosts: Post[] = [
        { id: '1', title: 'Post 1', content: '...', redactor: 'r1' },
        { id: '2', title: 'Post 2', content: '...', redactor: 'r2' },
      ];

      service.getAllPosts().subscribe((data) => {
        expect(data).toEqual(mockPosts);
      });

      const req = httpMock.expectOne(`${environment.postUrl}/getAll`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });

  describe('getDraftsByRedactor', () => {
    it('should GET from /drafts with redactor param', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const redactorName = 'someone';
      const mockDrafts: Post[] = [{ id: '1', title: 'Draft 1', content: '...' , redactor: redactorName }];

      service.getDraftsByRedactor(redactorName).subscribe((data) => {
        expect(data).toEqual(mockDrafts);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.postUrl}/drafts` && r.params.has('redactor')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('redactor')).toBe('someone');
      req.flush(mockDrafts);
    });
  });

  describe('filterPosts', () => {
    it('should GET from /filter with query params if provided', () => {
      authServiceMock.getRole.and.returnValue('user');
      const mockPosts: Post[] = [{ id: '1', title: 'Filtered', content: '...' , redactor: 'someone' }];

      service.filterPosts('some content', 'some redactor', '2025-10-10').subscribe((data) => {
        expect(data).toEqual(mockPosts);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.postUrl}/filter`
              && r.params.get('content') === 'some content'
              && r.params.get('redactor') === 'some redactor'
              && r.params.get('date') === '2025-10-10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });

  describe('getNeedsChangingPosts', () => {
    it('should GET from /needs-changing with redactor param', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      const mockPosts: Post[] = [{ id: '1', title: 'Needs fix', content: '...' , redactor: 'redactorUser' }];

      service.getNeedsChangingPosts('redactorUser').subscribe((data) => {
        expect(data).toEqual(mockPosts);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${environment.postUrl}/needs-changing` && r.params.get('redactor') === 'redactorUser'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPosts);
    });
  });
});
