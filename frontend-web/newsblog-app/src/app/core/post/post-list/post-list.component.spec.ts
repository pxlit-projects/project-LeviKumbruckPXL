import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostListComponent } from './post-list.component';
import { PostService } from '../../../shared/services/postService/post.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;

  let postServiceMock: jasmine.SpyObj<PostService>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>(
      'PostService',
      ['getAllPosts', 'updatePost']
    );

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [PostListComponent], 
      providers: [
        { provide: PostService, useValue: postServiceMock },
        { provide: Router, useValue: routerMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
  });


  describe('ngOnInit', () => {
    it('should call fetchPosts and set userRole from sessionStorage if present', () => {
      const user = { role: 'admin' };
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(user));
      spyOn(component, 'fetchPosts');

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.fetchPosts).toHaveBeenCalled();
      expect(component.userRole).toBe('admin');
    });

    it('should leave userRole as null if no user in sessionStorage', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);
      spyOn(component, 'fetchPosts');

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.fetchPosts).toHaveBeenCalled();
      expect(component.userRole).toBeNull();
    });
  });

  describe('fetchPosts', () => {
    it('should set posts on success and clear errorMessage', () => {
      const mockPosts: Post[] = [
        { id: '1', title: 'Test Post', content: 'Content', redactor: 'Author' },
        { id: '2', title: 'Another Post', content: 'More Content', redactor: 'Author 2' },
      ];
      postServiceMock.getAllPosts.and.returnValue(of(mockPosts));

      fixture.detectChanges(); // triggert ngOnInit -> fetchPosts
      expect(postServiceMock.getAllPosts).toHaveBeenCalled();
      expect(component.posts).toEqual(mockPosts);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      postServiceMock.getAllPosts.and.returnValue(
        throwError(() => new Error('Error'))
      );

      fixture.detectChanges(); // triggert ngOnInit -> fetchPosts
      expect(postServiceMock.getAllPosts).toHaveBeenCalled();
      expect(component.posts).toEqual([]);
      expect(component.errorMessage).toBe('Failed to fetch posts. Please try again later.');
    });
  });

  describe('onFilteredPosts', () => {
    it('should set filteredPosts and isFiltered to true', () => {
      const filtered: Post[] = [
        { id: '10', title: 'Filtered Post', content: 'Hello', redactor: 'Me' }
      ];
      component.onFilteredPosts(filtered);
      expect(component.filteredPosts).toEqual(filtered);
      expect(component.isFiltered).toBeTrue();
    });
  });

  describe('onResetFilters', () => {
    it('should reset isFiltered to false and clear filteredPosts', () => {
      component.isFiltered = true;
      component.filteredPosts = [
        { id: '9', title: 'Another Filtered', content: '...', redactor: 'Someone' }
      ];

      component.onResetFilters();
      expect(component.isFiltered).toBeFalse();
      expect(component.filteredPosts).toEqual([]);
    });
  });

  describe('editPost', () => {
    it('should set selectedPost to a copy of the given post', () => {
      const post: Post = { id: '3', title: 'Edit me', content: 'Old content', redactor: 'User' };
      component.editPost(post);

      expect(component.selectedPost).toEqual(post);
      expect(component.selectedPost).not.toBe(post);
    });
  });

  describe('cancelEdit', () => {
    it('should set selectedPost to null', () => {
      component.selectedPost = { id: '5', title: 'Hi', content: '...', redactor: 'Author' };
      component.cancelEdit();
      expect(component.selectedPost).toBeNull();
    });
  });

  describe('saveUpdatedPost', () => {
    let mockUpdated: Post;
    beforeEach(() => {
      mockUpdated = { id: '1', title: 'New Title', content: 'New Content', redactor: '...' };

      component.posts = [
        { id: '1', title: 'Old Title', content: 'Old Content', redactor: '...' },
        { id: '2', title: 'Some Post', content: 'Hello', redactor: '...' }
      ];
    });

    it('should update the post list on success and clear errorMessage', () => {
      const updatedResponse: Post = { ...mockUpdated };
      postServiceMock.updatePost.and.returnValue(of(updatedResponse));

      component.saveUpdatedPost(mockUpdated);
      expect(postServiceMock.updatePost)
        .toHaveBeenCalledWith(Number(mockUpdated.id), mockUpdated);

      expect(component.posts[0]).toEqual(updatedResponse);
      expect(component.errorMessage).toBe('');
      expect(component.selectedPost).toBeNull();
    });

    it('should set errorMessage on error', () => {
      postServiceMock.updatePost.and.returnValue(
        throwError(() => new Error('Update Error'))
      );
      component.saveUpdatedPost(mockUpdated);

      expect(component.errorMessage).toBe('Failed to update post. Please try again later.');
    });
  });

  describe('viewComments', () => {
    it('should navigate to /posts/:postId/comments', () => {
      component.viewComments(123);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/posts', 123, 'comments']);
    });
  });
});
