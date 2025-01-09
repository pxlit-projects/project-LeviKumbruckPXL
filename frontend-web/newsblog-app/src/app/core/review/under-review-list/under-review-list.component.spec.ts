import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnderReviewListComponent } from './under-review-list.component';
import { ReviewService } from '../../../shared/services/reviewService/review.service';
import { of, throwError } from 'rxjs';
import { Review } from '../../../shared/models/review.model';

describe('UnderReviewListComponent', () => {
  let component: UnderReviewListComponent;
  let fixture: ComponentFixture<UnderReviewListComponent>;
  let reviewServiceMock: jasmine.SpyObj<ReviewService>;

  const mockReviews: Review[] = [
    {
      postId: '101',
      postTitle: 'Test Title 1',
      postContent: 'Test Content 1',
      status: 'underReview',
      comment: ''
    },
    {
      postId: '102',
      postTitle: 'Test Title 2',
      postContent: 'Test Content 2',
      status: 'underReview',
      comment: 'Previously rejected due to minor issues.'
    }
  ];

  beforeEach(async () => {
    reviewServiceMock = jasmine.createSpyObj<ReviewService>('ReviewService', [
      'getAllReviews',
      'approvePost',
      'rejectPost'
    ]);

    await TestBed.configureTestingModule({
      imports: [UnderReviewListComponent],
      providers: [
        { provide: ReviewService, useValue: reviewServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnderReviewListComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should create the component and fetch reviews', () => {
      spyOn(component, 'fetchReviews');
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ role: 'admin' }));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component).toBeTruthy();
      expect(component.fetchReviews).toHaveBeenCalled();
      expect(component.userRole).toBe('admin');
    });
  });

  describe('fetchReviews', () => {
    it('should set reviews on success', () => {
      reviewServiceMock.getAllReviews.and.returnValue(of(mockReviews));

      fixture.detectChanges(); // triggert ngOnInit -> fetchReviews
      expect(reviewServiceMock.getAllReviews).toHaveBeenCalled();
      expect(component.reviews).toEqual(mockReviews);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      reviewServiceMock.getAllReviews.and.returnValue(
        throwError(() => new Error('Fetch error'))
      );

      fixture.detectChanges(); // triggert ngOnInit -> fetchReviews
      expect(reviewServiceMock.getAllReviews).toHaveBeenCalled();
      expect(component.reviews).toEqual([]);
      expect(component.errorMessage).toBe('Failed to fetch reviews. Please try again later.');
    });
  });

  describe('approvePost', () => {
    beforeEach(() => {
      component.reviews = [...mockReviews];
    });

    it('should remove the approved review from the list on success', () => {
      reviewServiceMock.approvePost.and.returnValue(of(void 0));

      component.approvePost('101');
      expect(reviewServiceMock.approvePost).toHaveBeenCalledWith('101');
      expect(component.reviews.some(r => r.postId === '101')).toBeFalse();
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on failure', () => {
      reviewServiceMock.approvePost.and.returnValue(
        throwError(() => new Error('Approve error'))
      );

      component.approvePost('101');
      expect(component.errorMessage).toBe('Failed to approve post.');
    });
  });
});
