import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should store user in sessionStorage', () => {
      service.login('testUser', 'redactor');
      const storedUser = sessionStorage.getItem('user');
      expect(storedUser).toBeTruthy();
      expect(JSON.parse(storedUser!)).toEqual({ username: 'testUser', role: 'redactor' });
    });
  });

  describe('logout', () => {
    it('should remove user from sessionStorage', () => {
      service.login('testUser', 'redactor');
      service.logout();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return the current user if in sessionStorage', () => {
      service.login('testUser', 'redactor');
      const user = service.getUser();
      expect(user).toEqual({ username: 'testUser', role: 'redactor' });
    });

    it('should return null if no user in sessionStorage', () => {
      const user = service.getUser();
      expect(user).toBeNull();
    });
  });

  describe('getRole', () => {
    it('should return the role of the current user', () => {
      service.login('anotherUser', 'admin');
      expect(service.getRole()).toBe('admin');
    });

    it('should return null if no user is logged in', () => {
      expect(service.getRole()).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if a user is stored', () => {
      service.login('me', 'user');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false if no user is stored', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
