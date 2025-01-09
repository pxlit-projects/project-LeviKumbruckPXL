import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentItemComponent } from './comment-item.component';
import { Comment } from '../../../shared/models/comment.model';
import { By } from '@angular/platform-browser';

describe('CommentItemComponent', () => {
  let component: CommentItemComponent;
  let fixture: ComponentFixture<CommentItemComponent>;

  const mockComment: Comment = {
    id: 10,
    postId: 123,
    user: 'userA',
    content: 'A comment',
    createdDate: '2025-01-01T10:00:00Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentItemComponent);
    component = fixture.componentInstance;
    component.comment = { ...mockComment };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Template Rendering', () => {
    it('should display the comment user and content when not editing', () => {
      component.isEditing = false;
      fixture.detectChanges();

      const userEl = fixture.debugElement.query(By.css('.font-semibold.text-blue-600'));
      const contentEl = fixture.debugElement.query(By.css('p'));
      expect(userEl.nativeElement.textContent).toContain(mockComment.user);
      expect(contentEl.nativeElement.textContent).toContain(mockComment.content);
    });

  });

  describe('Edit/Delete buttons', () => {
    it('should show edit/delete buttons if comment.user === currentUser', () => {
      component.currentUser = 'userA';
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('button.text-green-600'));
      const deleteButton = fixture.debugElement.query(By.css('button.text-red-600'));
      expect(editButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });

    it('should not show edit/delete buttons if comment.user !== currentUser', () => {
      component.currentUser = 'someoneElse';
      fixture.detectChanges();

      const editButton = fixture.debugElement.query(By.css('button.text-green-600'));
      const deleteButton = fixture.debugElement.query(By.css('button.text-red-600'));
      expect(editButton).toBeFalsy();
      expect(deleteButton).toBeFalsy();
    });
  });

  describe('Event Emitters', () => {
    it('should emit startEdit with comment on onStartEdit()', () => {
      spyOn(component.startEdit, 'emit');
      component.onStartEdit();
      expect(component.startEdit.emit).toHaveBeenCalledWith(mockComment);
    });

    it('should emit delete with comment.id on onDelete()', () => {
      spyOn(component.delete, 'emit');
      component.onDelete();
      expect(component.delete.emit).toHaveBeenCalledWith(mockComment.id);
    });

    it('should emit saveEdit with id and editedContent on onSaveEdit()', () => {
      spyOn(component.saveEdit, 'emit');
      component.editedContent = 'New content';
      component.onSaveEdit();
      expect(component.saveEdit.emit).toHaveBeenCalledWith({
        id: mockComment.id!,
        content: 'New content',
      });
    });

    it('should emit cancelEdit on onCancelEdit()', () => {
      spyOn(component.cancelEdit, 'emit');
      component.onCancelEdit();
      expect(component.cancelEdit.emit).toHaveBeenCalled();
    });
  });
});
