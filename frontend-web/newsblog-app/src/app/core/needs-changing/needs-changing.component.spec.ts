import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedsChangingComponent } from './needs-changing.component';

describe('NeedsChangingComponent', () => {
  let component: NeedsChangingComponent;
  let fixture: ComponentFixture<NeedsChangingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeedsChangingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeedsChangingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
