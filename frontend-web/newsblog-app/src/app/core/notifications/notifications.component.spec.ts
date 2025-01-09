import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from '../../shared/services/notificationService/notification.service';
import { of, throwError } from 'rxjs';
import { Notification } from '../../shared/models/notification.model';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockNotifications: Notification[] = [
    { id: 1, postId: 101, redactor: 'mockUser', message: 'Test notification 1' },
    { id: 2, postId: 102, redactor: 'mockUser', message: 'Test notification 2' },
  ];

  beforeEach(async () => {
    notificationServiceMock = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['getNotifications', 'deleteNotification']
    );

    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
  });


  describe('ngOnInit', () => {
    it('should call getRedactorUsername() and fetchNotifications()', () => {
      spyOn(component, 'getRedactorUsername').and.callThrough();
      spyOn(component, 'fetchNotifications').and.callThrough();

      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ username: 'mockUser' }));
      notificationServiceMock.getNotifications.and.returnValue(of([]));

      fixture.detectChanges(); // triggert ngOnInit

      expect(component.getRedactorUsername).toHaveBeenCalled();
      expect(component.fetchNotifications).toHaveBeenCalled();
    });

    it('should set redactor from sessionStorage if user is found', () => {
      const user = { username: 'testRedactor' };
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify(user));
      notificationServiceMock.getNotifications.and.returnValue(of([]));

      fixture.detectChanges(); // triggert ngOnInit
      expect(component.redactor).toBe('testRedactor');
    });

    it('should leave redactor as empty if no user in sessionStorage', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null);

      fixture.detectChanges();
      expect(component.redactor).toBe('');
    });
  });

  describe('fetchNotifications', () => {
    beforeEach(() => {
      component.redactor = 'mockUser';
    });

    it('should not call notificationService if redactor is empty', () => {
      component.redactor = '';
      component.fetchNotifications();
      expect(notificationServiceMock.getNotifications).not.toHaveBeenCalled();
    });

    it('should set notifications on success', () => {
      notificationServiceMock.getNotifications.and.returnValue(of(mockNotifications));

      component.fetchNotifications();
      expect(notificationServiceMock.getNotifications).toHaveBeenCalledWith('mockUser');
      expect(component.notifications).toEqual(mockNotifications);
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('');
    });

    it('should set error message on error', () => {
      notificationServiceMock.getNotifications.and.returnValue(
        throwError(() => new Error('Failed to load'))
      );

      component.fetchNotifications();
      expect(notificationServiceMock.getNotifications).toHaveBeenCalled();
      expect(component.notifications).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('Failed to load notifications.');
    });
  });

  describe('deleteNotification', () => {
    beforeEach(() => {
      component.notifications = [...mockNotifications];
    });

    it('should remove the notification on success and clear error', () => {
      notificationServiceMock.deleteNotification.and.returnValue(of(undefined));

      component.deleteNotification(1);
      expect(notificationServiceMock.deleteNotification).toHaveBeenCalledWith(1);

      expect(component.notifications.length).toBe(1);
      expect(component.notifications[0].id).toBe(2);
      expect(component.error).toBe('');
    });

    it('should set error message on failure', () => {
      notificationServiceMock.deleteNotification.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      component.deleteNotification(1);
      expect(component.error).toBe('Failed to delete notification.');
    });
  });
});
