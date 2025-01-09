import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnderReviewItemComponent } from './under-review-item.component';
import { Review } from '../../../shared/models/review.model';

describe('UnderReviewItemComponent', () => {
  let component: UnderReviewItemComponent;
  let fixture: ComponentFixture<UnderReviewItemComponent>;

  const mockReview: Review = {
    postId: '999',
    postTitle: 'Sample Title',
    postContent: 'Sample Content',
    status: 'underReview',
    comment: 'Sample Rejection Comment',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderReviewItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UnderReviewItemComponent);
    component = fixture.componentInstance;
    component.review = { ...mockReview };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Approve/Reject Buttons', () => {
    it('should emit approve event with the review.postId on onApprove()', () => {
      spyOn(component.approve, 'emit');
      component.onApprove();
      expect(component.approve.emit).toHaveBeenCalledWith('999');
    });

    it('should emit reject event with the review.postId and rejectionComment on onReject()', () => {
      spyOn(component.reject, 'emit');
      component.rejectionComment = 'New Rejection Reason';
      component.onReject();
      expect(component.reject.emit).toHaveBeenCalledWith({
        postId: '999',
        comment: 'New Rejection Reason'
      });
    });
  });

  describe('rejectionComment binding', () => {
    it('should have an empty rejectionComment by default', () => {
      const newFixture = TestBed.createComponent(UnderReviewItemComponent);
      const newComp = newFixture.componentInstance;
      expect(newComp.rejectionComment).toBe('');
    });
  });
});
