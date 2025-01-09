import { TestBed } from '@angular/core/testing';
import { AddPostComponent } from './add-post.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddPostComponent (Smoke Test)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddPostComponent,
        HttpClientTestingModule, 
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AddPostComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges(); // triggert ngOnInit
    expect(component).toBeTruthy();
  });
});
