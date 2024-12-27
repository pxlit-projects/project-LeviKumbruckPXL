import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderReviewItemComponent } from './under-review-item.component';

describe('UnderReviewItemComponent', () => {
  let component: UnderReviewItemComponent;
  let fixture: ComponentFixture<UnderReviewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderReviewItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderReviewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
