import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../shared/services/authService/auth.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('login()', () => {
    it('should not call authService.login if username or role is missing', () => {
      component.username = '';
      component.role = 'redactor';
      component.login();
      expect(authServiceMock.login).not.toHaveBeenCalled();

      component.username = 'someUser';
      component.role = '';
      component.login();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with correct credentials if both username and role are present', () => {
      component.username = 'testUser';
      component.role = 'redactor';

      component.login();
      expect(authServiceMock.login).toHaveBeenCalledWith('testUser', 'redactor');
    });

    it('should navigate to /addPost if role is "redactor"', () => {
      component.username = 'redactorUser';
      component.role = 'redactor';
      component.login();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/addPost']);
    });

    it('should navigate to /posts if role is "user"', () => {
      component.username = 'normalUser';
      component.role = 'user';
      component.login();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });
});
