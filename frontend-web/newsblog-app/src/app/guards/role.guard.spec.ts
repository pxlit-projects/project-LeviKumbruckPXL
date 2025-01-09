import { TestBed } from '@angular/core/testing';
import { AuthService } from '../shared/services/authService/auth.service';
import { isRedactorGuard } from './role.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('isRedactorGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['getRole']);

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = {} as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
  });

  it('should return true if authService.getRole() is "redactor"', () => {
    authServiceMock.getRole.and.returnValue('redactor');

    const result = TestBed.runInInjectionContext(() => {
      return isRedactorGuard(mockRoute, mockState);
    });
    expect(result).toBeTrue();
  });

  it('should return false if authService.getRole() is NOT "redactor"', () => {
    authServiceMock.getRole.and.returnValue('user');

    const result = TestBed.runInInjectionContext(() => {
      return isRedactorGuard(mockRoute, mockState);
    });
    expect(result).toBeFalse();
  });

  it('should return false if authService.getRole() is null/undefined', () => {
    authServiceMock.getRole.and.returnValue(null as unknown as string);

    const result = TestBed.runInInjectionContext(() => {
      return isRedactorGuard(mockRoute, mockState);
    });
    expect(result).toBeFalse();
  });
});
