import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderReviewListComponent } from './under-review-list.component';

describe('UnderReviewListComponent', () => {
  let component: UnderReviewListComponent;
  let fixture: ComponentFixture<UnderReviewListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnderReviewListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderReviewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
