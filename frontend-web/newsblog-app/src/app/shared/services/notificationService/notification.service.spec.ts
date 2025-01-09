import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Notification } from '../../models/notification.model';
import { environment } from '../../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(sessionStorage, 'getItem').and.returnValue(
      JSON.stringify({ role: 'redactor' })
    );
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should GET notifications with redactor param', () => {
      const redactor = 'mockRedactor';
      const mockNotifications: Notification[] = [
        { id: 1, postId: 101, redactor: 'mockRedactor', message: 'Notify 1' },
        { id: 2, postId: 102, redactor: 'mockRedactor', message: 'Notify 2' },
      ];

      service.getNotifications(redactor).subscribe((data) => {
        expect(data).toEqual(mockNotifications);
      });

      const req = httpMock.expectOne(
        (r) => r.url === environment.notificationUrl && r.params.get('redactor') === 'mockRedactor'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Role')).toBe('redactor');
      req.flush(mockNotifications);
    });
  });

  /*
  describe('deleteNotification', () => {
    
    it('should DELETE notification by ID', () => {
      service.deleteNotification(123).subscribe((resp) => {
        expect(resp).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.notificationUrl}/123`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Role')).toBe('redactor'); // from sessionStorage
      req.flush(null);
    });
    
  });
  */
});
