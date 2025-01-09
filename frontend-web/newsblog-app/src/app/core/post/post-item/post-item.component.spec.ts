import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PostItemComponent } from './post-item.component';
import { Post } from '../../../shared/models/post.model';

describe('PostItemComponent', () => {
  let component: PostItemComponent;
  let fixture: ComponentFixture<PostItemComponent>;

  const mockPost: Post = {
    id: '123',
    title: 'Sample Post',
    content: 'This is a sample post content.',
    redactor: 'John Doe',
    createdDate: '2023-09-15T10:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostItemComponent);
    component = fixture.componentInstance;

    component.post = mockPost;
    component.userRole = null; 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the post details correctly', () => {

    const titleEl = fixture.debugElement.query(By.css('h2'));
    expect(titleEl.nativeElement.textContent).toContain(mockPost.title);

    const contentEl = fixture.debugElement.query(By.css('p'));
    expect(contentEl.nativeElement.textContent).toContain(mockPost.content);

    const redactorEl = fixture.debugElement.query(By.css('.text-red-900'));
    expect(redactorEl.nativeElement.textContent).toContain(mockPost.redactor);
  });

  it('should display the createdDate with a "medium" date pipe', () => {

    const dateEl = fixture.debugElement.query(By.css('.text-sm.text-gray-500 span:nth-child(2)'));
    expect(dateEl.nativeElement.textContent).toContain('2023');
  });

  it('should show the "View Comments" button always', () => {
    const viewCommentsButton = fixture.debugElement.query(By.css('button'));
    expect(viewCommentsButton).toBeTruthy(); 
    expect(viewCommentsButton.nativeElement.textContent).toContain('View Comments');
  });

  it('should not show the "Edit" button if userRole is not "redactor"', () => {

    const editButton = fixture.debugElement.query(By.css('button:nth-child(2)'));
    expect(editButton).toBeFalsy(); 
  });

  it('should show the "Edit" button if userRole is "redactor"', () => {
    component.userRole = 'redactor';
    fixture.detectChanges();

    const editButton = fixture.debugElement.queryAll(By.css('button'))
      .find(btn => btn.nativeElement.textContent.includes('Edit'));
    expect(editButton).toBeTruthy();
  });

  it('should emit the post when onEdit() is called', () => {
    spyOn(component.edit, 'emit');

    component.userRole = 'redactor';
    fixture.detectChanges();

    const editButton = fixture.debugElement.queryAll(By.css('button'))
      .find(btn => btn.nativeElement.textContent.includes('Edit'));
    editButton!.nativeElement.click();

    expect(component.edit.emit).toHaveBeenCalledWith(mockPost);
  });

  it('should emit a number for post.id when onViewComments() is called', () => {
    spyOn(component.viewComments, 'emit');

    const viewCommentsButton = fixture.debugElement.query(By.css('button'));
    viewCommentsButton.nativeElement.click();

    expect(component.viewComments.emit).toHaveBeenCalledWith(Number(mockPost.id));
  });
});
