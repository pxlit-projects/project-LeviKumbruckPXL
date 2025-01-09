import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraftsComponent } from './drafts.component';
import { PostService } from '../../../shared/services/postService/post.service';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';

describe('DraftsComponent', () => {
  let component: DraftsComponent;
  let fixture: ComponentFixture<DraftsComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;

  const mockDrafts: Post[] = [
    { id: '1', title: 'Draft 1', content: '...', redactor: 'someone', createdDate: '2025-01-08T10:00:00Z' },
    { id: '2', title: 'Draft 2', content: '...', redactor: 'someone', createdDate: '2025-01-09T14:00:00Z' }
  ];

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>('PostService', [
      'getDraftsByRedactor',
      'sendDraftForReview'
    ]);

    await TestBed.configureTestingModule({
      imports: [DraftsComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DraftsComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'someone' }));
      postServiceMock.getDraftsByRedactor.and.returnValue(of(mockDrafts));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component).toBeTruthy();
    });

    it('should call fetchDrafts on ngOnInit', () => {
      spyOn(component, 'fetchDrafts');
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'someone' }));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.fetchDrafts).toHaveBeenCalled();
    });
  });

  describe('fetchDrafts', () => {
    beforeEach(() => {
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'someone' }));
    });

    it('should set drafts on success', () => {
      postServiceMock.getDraftsByRedactor.and.returnValue(of(mockDrafts));
      fixture.detectChanges(); // triggert ngOnInit -> fetchDrafts

      expect(component.drafts).toEqual(mockDrafts);
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      postServiceMock.getDraftsByRedactor.and.returnValue(
        throwError(() => new Error('Fetch error'))
      );
      fixture.detectChanges();

      expect(component.drafts).toEqual([]);
      expect(component.errorMessage).toBe('Failed to fetch drafts. Please try again later.');
    });
  });

  describe('editDraft', () => {
    it('should set selectedDraft to the given draft', () => {
      const draft: Post = { id: '1', title: 'Draft', content: '...', redactor: 'me' };
      component.editDraft(draft);
      expect(component.selectedDraft).toBe(draft);
    });
  });

  describe('cancelEdit', () => {
    it('should set selectedDraft to null', () => {
      component.selectedDraft = { id: '1', title: '...', content: '...', redactor: '...' };
      component.cancelEdit();
      expect(component.selectedDraft).toBeNull();
    });
  });

  describe('updateDraftList', () => {
    beforeEach(() => {
      component.drafts = [...mockDrafts];
    });

    it('should replace the matching draft with updated one and reset selectedDraft', () => {
      const updatedDraft: Post = { ...mockDrafts[0], title: 'Updated Draft 1' };
      component.updateDraftList(updatedDraft);

      const found = component.drafts.find(d => d.id === '1');
      expect(found?.title).toBe('Updated Draft 1');
      expect(component.selectedDraft).toBeNull();
    });
  });

  describe('sendDraftForReview', () => {
    beforeEach(() => {
      component.drafts = [...mockDrafts];
    });

    it('should remove draft from array on success', () => {
      postServiceMock.sendDraftForReview.and.returnValue(of({ id: '1', ...mockDrafts[0] }));
      component.sendDraftForReview(mockDrafts[0]);

      expect(postServiceMock.sendDraftForReview).toHaveBeenCalledWith(Number(mockDrafts[0].id));
      expect(component.drafts.length).toBe(1);
      expect(component.drafts[0].id).toBe('2');
      expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on error', () => {
      postServiceMock.sendDraftForReview.and.returnValue(
        throwError(() => new Error('Publish error'))
      );
      component.sendDraftForReview(mockDrafts[0]);
      expect(component.errorMessage).toBe('Failed to publish draft. Please try again later.');
    });
  });
});
