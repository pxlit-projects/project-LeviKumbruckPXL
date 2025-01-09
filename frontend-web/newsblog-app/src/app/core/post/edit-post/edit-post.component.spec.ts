import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPostComponent } from './edit-post.component';
import { By } from '@angular/platform-browser';
import { Post } from '../../../shared/models/post.model';

describe('EditPostComponent', () => {
  let component: EditPostComponent;
  let fixture: ComponentFixture<EditPostComponent>;

  const mockPost: Post = {
    id: '123',
    title: 'Sample Title',
    content: 'Sample Content',
    redactor: 'John Doe',
    createdDate: '2023-10-08T00:00:00.000Z',
    reviewComment: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPostComponent);
    component = fixture.componentInstance;
    component.post = { ...mockPost }; 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind post.title and post.content to input fields', () => {

    const titleInput = fixture.debugElement.query(By.css('input[name="title"]'))
      .nativeElement as HTMLInputElement;
    expect(titleInput.value).toBe(mockPost.title);


    const contentTextarea = fixture.debugElement.query(By.css('textarea[name="content"]'))
      .nativeElement as HTMLTextAreaElement;
    expect(contentTextarea.value).toBe(mockPost.content);
  });

  it('should emit save event with the updated post when onSave() is called', () => {

    spyOn(component.save, 'emit');


    const newTitle = 'New Post Title';
    const newContent = 'New Post Content';


    const titleInput = fixture.debugElement.query(By.css('input[name="title"]'))
      .nativeElement as HTMLInputElement;
    titleInput.value = newTitle;
    titleInput.dispatchEvent(new Event('input'));

    const contentTextarea = fixture.debugElement.query(By.css('textarea[name="content"]'))
      .nativeElement as HTMLTextAreaElement;
    contentTextarea.value = newContent;
    contentTextarea.dispatchEvent(new Event('input'));

    fixture.detectChanges();


    const saveButton = fixture.debugElement.query(By.css('button.bg-green-600'));
    saveButton.nativeElement.click();


    expect(component.save.emit).toHaveBeenCalledWith({
      ...mockPost,
      title: newTitle,
      content: newContent,
    });
  });

  it('should emit cancelEdit event when onCancel() is called', () => {
    spyOn(component.cancelEdit, 'emit');


    const cancelButton = fixture.debugElement.query(By.css('button.bg-gray-600'));
    cancelButton.nativeElement.click();

    expect(component.cancelEdit.emit).toHaveBeenCalled();
  });
});
