import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCommentComponent } from './add-comment.component';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommentComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggert ngOnInit 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should create a form with "content" control, required validator', () => {
      const form = component.commentForm;
      expect(form).toBeTruthy();
      const contentControl = form.get('content');
      expect(contentControl).toBeTruthy();
      expect(contentControl?.hasError('required')).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    

    it('should emit errorOccurred if content is empty/blank', () => {
      spyOn(component.commentAdded, 'emit');
      spyOn(component.errorOccurred, 'emit');

      const contentControl = component.commentForm.get('content');
      contentControl?.setValue('   ');
      fixture.detectChanges();

      const formEl = fixture.debugElement.query(By.css('form'));
      formEl.triggerEventHandler('ngSubmit', null);

      expect(component.errorOccurred.emit).toHaveBeenCalledWith('Comment content cannot be empty.');
      expect(component.commentAdded.emit).not.toHaveBeenCalled();
    });

    it('should emit errorOccurred if the form is invalid', () => {
      spyOn(component.errorOccurred, 'emit');
      fixture.detectChanges();

      const formEl = fixture.debugElement.query(By.css('form'));
      formEl.triggerEventHandler('ngSubmit', null);

      expect(component.errorOccurred.emit).toHaveBeenCalledWith('Comment content cannot be empty.');
    });
  });
});
