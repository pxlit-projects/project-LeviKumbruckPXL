import { TestBed } from '@angular/core/testing';
import { ReviewService } from './review.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../authService/auth.service';
import { environment } from '../../../../environments/environment';
import { Review } from '../../models/review.model';
import { provideHttpClient } from '@angular/common/http';

describe('ReviewService', () => {
  let service: ReviewService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['getRole']);

    TestBed.configureTestingModule({
      providers: [
        ReviewService,
        { provide: AuthService, useValue: authServiceMock }, provideHttpClient(), provideHttpClientTesting()
      ],
    });

    service = TestBed.inject(ReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllReviews', () => {
    it('should send GET request to /viewSubmittedPosts and return Review[]', () => {
      authServiceMock.getRole.and.returnValue('admin');
      const mockReviews: Review[] = [
        { postId: '1', postTitle: 'Title1', postContent: 'Content1', status: 'underReview' },
        { postId: '2', postTitle: 'Title2', postContent: 'Content2', status: 'underReview' },
      ];

      service.getAllReviews().subscribe((reviews) => {
        expect(reviews).toEqual(mockReviews);
      });

      const req = httpMock.expectOne(`${environment.reviewUrl}/viewSubmittedPosts`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Role')).toBe('admin');

      req.flush(mockReviews);
    });

    it('should handle error response from the server', () => {
      authServiceMock.getRole.and.returnValue('admin');

      service.getAllReviews().subscribe({
        next: () => fail('Expected an error, but got success'),
        error: (err) => {
          expect(err).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`${environment.reviewUrl}/viewSubmittedPosts`);
      expect(req.request.method).toBe('GET');

      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('approvePost', () => {
    

    it('should handle error when approving post', () => {
      authServiceMock.getRole.and.returnValue('redactor');

      service.approvePost('999').subscribe({
        next: () => fail('Expected error, got success'),
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(`${environment.reviewUrl}/approve/999`);
      expect(req.request.method).toBe('PUT');
      req.flush('Error approving', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('rejectPost', () => {
    

    it('should handle error when rejecting post', () => {
      authServiceMock.getRole.and.returnValue('admin');

      service.rejectPost('888', 'Some reason').subscribe({
        next: () => fail('Expected an error, got success'),
        error: (err) => expect(err).toBeTruthy(),
      });

      const req = httpMock.expectOne(`${environment.reviewUrl}/reject/888`);
      expect(req.request.method).toBe('PUT');
      req.flush('Rejected error', { status: 400, statusText: 'Bad Request' });
    });
  });
});
