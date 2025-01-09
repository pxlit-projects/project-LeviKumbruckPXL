import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterPostsComponent } from './filter-posts.component';
import { PostService } from '../../../shared/services/postService/post.service';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';

describe('FilterPostsComponent', () => {
  let component: FilterPostsComponent;
  let fixture: ComponentFixture<FilterPostsComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;

  beforeEach(async () => {

    postServiceMock = jasmine.createSpyObj<PostService>(
      'PostService',
      ['filterPosts'] 
    );

    await TestBed.configureTestingModule({

      imports: [FilterPostsComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial empty fields and no error message', () => {
    expect(component.content).toBe('');
    expect(component.author).toBe('');
    expect(component.date).toBe('');
    expect(component.errorMessage).toBe('');
  });

  describe('applyFilters', () => {
    const mockFilteredPosts: Post[] = [
      { id: '1', title: 'Test Post', content: 'Test Content', redactor: 'Alice' },
      { id: '2', title: 'Another Post', content: 'Lorem Ipsum', redactor: 'Bob' }
    ];

    it('should call postService.filterPosts with content, author, and date', () => {

      component.content = 'test content';
      component.author = 'John Doe';
      component.date = '2023-10-05';


      postServiceMock.filterPosts.and.returnValue(of(mockFilteredPosts));


      spyOn(component.filtered, 'emit');


      component.applyFilters();

      expect(postServiceMock.filterPosts).toHaveBeenCalledWith(
        'test content',
        'John Doe',
        '2023-10-05'
      );
    });

    it('should emit filtered posts on success', () => {
      postServiceMock.filterPosts.and.returnValue(of(mockFilteredPosts));
      spyOn(component.filtered, 'emit');

      component.applyFilters();

      expect(component.errorMessage).toBe('');
      expect(component.filtered.emit).toHaveBeenCalledWith(mockFilteredPosts);
    });

    it('should set errorMessage on error', () => {
      postServiceMock.filterPosts.and.returnValue(
        throwError(() => new Error('Failed to filter'))
      );

      spyOn(console, 'error');

      component.applyFilters();

      expect(component.errorMessage).toBe('Failed to filter posts. Please try again.');
    });
  });

  describe('resetFilters', () => {
    it('should reset content, author, date to empty strings and emit resetFilter', () => {
      component.content = 'some text';
      component.author = 'author test';
      component.date = '2023-10-05';

      spyOn(component.resetFilter, 'emit');

      component.resetFilters();

      expect(component.content).toBe('');
      expect(component.author).toBe('');
      expect(component.date).toBe('');
      expect(component.resetFilter.emit).toHaveBeenCalled();
    });
  });
});
