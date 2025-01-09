import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDraftComponent } from './edit-draft.component';
import { PostService } from '../../../shared/services/postService/post.service';
import { of, throwError } from 'rxjs';
import { Post } from '../../../shared/models/post.model';
import { By } from '@angular/platform-browser';

describe('EditDraftComponent', () => {
  let component: EditDraftComponent;
  let fixture: ComponentFixture<EditDraftComponent>;
  let postServiceMock: jasmine.SpyObj<PostService>;

  const mockDraft: Post = {
    id: '123',
    title: 'Original Title',
    content: 'Original Content',
    redactor: 'Editor',
    createdDate: '2025-01-01T09:30:00Z',
    reviewComment: 'Needs revision'
  };

  beforeEach(async () => {
    postServiceMock = jasmine.createSpyObj<PostService>(
      'PostService',
      ['updatePost']
    );

    await TestBed.configureTestingModule({
      imports: [EditDraftComponent],
      providers: [
        { provide: PostService, useValue: postServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditDraftComponent);
    component = fixture.componentInstance;
    component.draft = { ...mockDraft };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind draft.title and draft.content to input fields', () => {
    const titleInput = fixture.debugElement.query(By.css('input[name="title"]'))
      .nativeElement as HTMLInputElement;
    const contentTextArea = fixture.debugElement.query(By.css('textarea[name="content"]'))
      .nativeElement as HTMLTextAreaElement;

    expect(titleInput.value).toBe(mockDraft.title);
    expect(contentTextArea.value).toBe(mockDraft.content);
  });

  describe('saveDraft', () => {
    beforeEach(() => {
      
      const newTitle = 'Updated Draft Title';
      const newContent = 'Updated Draft Content';

      const titleInput = fixture.debugElement.query(By.css('input[name="title"]'))
        .nativeElement as HTMLInputElement;
      titleInput.value = newTitle;
      titleInput.dispatchEvent(new Event('input'));

      const contentTextArea = fixture.debugElement.query(By.css('textarea[name="content"]'))
        .nativeElement as HTMLTextAreaElement;
      contentTextArea.value = newContent;
      contentTextArea.dispatchEvent(new Event('input'));

      fixture.detectChanges();
    });

    it('should call postService.updatePost with cast draft.id and updated draft, then emit draftUpdated on success', () => {
      const updatedDraft: Post = {
        ...mockDraft,
        title: 'Updated Draft Title',
        content: 'Updated Draft Content'
      };

      postServiceMock.updatePost.and.returnValue(of(updatedDraft));

      spyOn(component.draftUpdated, 'emit');

      const saveButton = fixture.debugElement.query(By.css('button.bg-blue-600'));
      saveButton.nativeElement.click();

      expect(postServiceMock.updatePost).toHaveBeenCalledWith(
        Number(updatedDraft.id), 
        jasmine.objectContaining({
          title: updatedDraft.title,
          content: updatedDraft.content
        })
      );
      expect(component.draftUpdated.emit).toHaveBeenCalledWith(updatedDraft);
    });

    it('should log an error to console if updatePost fails', () => {
      postServiceMock.updatePost.and.returnValue(
        throwError(() => new Error('Update error'))
      );
      spyOn(console, 'error');

      const saveButton = fixture.debugElement.query(By.css('button.bg-blue-600'));
      saveButton.nativeElement.click();

      expect(console.error).toHaveBeenCalledWith('Failed to save draft', jasmine.any(Error));
    });
  });

  describe('cancel', () => {
    it('should emit cancelEdit when cancel is called', () => {
      spyOn(component.cancelEdit, 'emit');

      const cancelButton = fixture.debugElement.query(By.css('button.bg-gray-600'));
      cancelButton.nativeElement.click();

      expect(component.cancelEdit.emit).toHaveBeenCalled();
    });
  });
});
