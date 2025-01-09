import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NeedsChangingComponent } from './needs-changing.component';
import { PostService } from '../../../shared/services/postService/post.service';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';

describe('NeedsChangingComponent', () => {
  let component: NeedsChangingComponent;
  let fixture: ComponentFixture<NeedsChangingComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;

  const mockPosts: Post[] = [
    { id: '1', title: 'Post 1', content: '...', redactor: 'someone', reviewComment: 'fix me' },
    { id: '2', title: 'Post 2', content: '...', redactor: 'someone', reviewComment: 'typo' }
  ];

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', [
      'getNeedsChangingPosts',
      'sendDraftForReview'
    ]);

    await TestBed.configureTestingModule({
      imports: [NeedsChangingComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NeedsChangingComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    beforeEach(() => {
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'someone' }));
    });

    it('should create', () => {
      postServiceMock.getNeedsChangingPosts.and.returnValue(of(mockPosts));
      fixture.detectChanges(); // triggert ngOnInit
      expect(component).toBeTruthy();
    });

    it('should set redactor from sessionStorage and fetchNeedsChangingPosts', () => {
      spyOn(component, 'fetchNeedsChangingPosts');
      fixture.detectChanges(); 
      expect(component.redactor).toBe('someone');
      expect(component.fetchNeedsChangingPosts).toHaveBeenCalled();
    });
  });

  describe('fetchNeedsChangingPosts', () => {
    beforeEach(() => {
      component.redactor = 'someone';
    });

    

    it('should set errorMessage on error', () => {
      postServiceMock.getNeedsChangingPosts.and.returnValue(
        throwError(() => new Error('Failed to load'))
      );
      fixture.detectChanges();

      expect(component.posts).toEqual([]);
      expect(component.errorMessage).toBe('Failed to fetch posts. Please try again later.');
    });
  });

  describe('editPost', () => {
    it('should set selectedPost to the given post', () => {
      const post: Post = { id: '999', title: 'Needs fix', content: '...', redactor: 'someone' };
      component.editPost(post);
      expect(component.selectedPost).toBe(post);
    });
  });

  

  describe('updatePostList', () => {
    beforeEach(() => {
      component.posts = [...mockPosts];
    });

    it('should update the matching post and reset selectedPost', () => {
      const updated: Post = { ...mockPosts[0], title: 'Updated Title' };
      component.updatePostList(updated);

      const found = component.posts.find(p => p.id === '1');
      expect(found?.title).toBe('Updated Title');
      expect(component.selectedPost).toBeNull();
    });
  });

  describe('resendForReview', () => {
    beforeEach(() => {
      component.posts = [...mockPosts];
    });

    

    it('should set errorMessage on error', () => {
      postServiceMock.sendDraftForReview.and.returnValue(
        throwError(() => new Error('Resend error'))
      );

      component.resendForReview(mockPosts[0]);
      expect(component.errorMessage).toBe('Failed to resend post for review.');
    });
  });
});
