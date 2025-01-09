import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthService } from './shared/services/authService/auth.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  let routerMock: Partial<Router & { url: string }>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerMock = {
      url: '/',
    };

    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['getRole']);

    await TestBed.configureTestingModule({
      imports: [AppComponent], 
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'newsblog-app' title`, () => {
    expect(component.title).toEqual('newsblog-app');
  });

  describe('isLoginPage()', () => {
    it('should return true if router.url is "/login"', () => {
      (routerMock as Partial<Router & { url: string }>).url = '/login';
      expect(component.isLoginPage()).toBeTrue();
    });

    it('should return false if router.url is something else', () => {
      (routerMock as Partial<Router & { url: string }>).url = '/posts';
      expect(component.isLoginPage()).toBeFalse();
    });
  });

  describe('isRedactor()', () => {
    it('should return true if authService.getRole() is "redactor"', () => {
      authServiceMock.getRole.and.returnValue('redactor');
      expect(component.isRedactor()).toBeTrue();
    });

    it('should return false if authService.getRole() is not "redactor"', () => {
      authServiceMock.getRole.and.returnValue('user');
      expect(component.isRedactor()).toBeFalse();
    });

    it('should return false if authService.getRole() is null/undefined', () => {
      authServiceMock.getRole.and.returnValue(null);
      expect(component.isRedactor()).toBeFalse();
    });
  });

  describe('Template Rendering', () => {
    
    it('should not render navbar if user is on login page', () => {
      (routerMock as Partial<Router & { url: string }>).url = '/login';
      fixture.detectChanges();

      const navbarEl = fixture.debugElement.query(By.css('app-navbar'));
      expect(navbarEl).toBeFalsy();
    });
  });
});
