import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderReviewComponent } from './under-review.component';

describe('UnderReviewComponent', () => {
  let component: UnderReviewComponent;
  let fixture: ComponentFixture<UnderReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
