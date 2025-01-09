import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/authService/auth.service';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let routerMock: jasmine.SpyObj<Router>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate', 'events', 'url']);
    (routerMock.events as jasmine.SpyObj<Router>['events']) = of(); 
    Object.defineProperty(routerMock, 'url', { get: () => '/posts' });

    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should set userRole from sessionStorage if present', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(JSON.stringify({ role: 'redactor' }));
      fixture.detectChanges(); // triggert ngOnInit
      expect(component.userRole).toBe('redactor');
    });


  });

  describe('navigateToPosts', () => {
    it('should call router.navigate with ["/posts"]', () => {
      component.navigateToPosts();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/posts']);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and navigate to /login', () => {
      component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('navigateToAddPost', () => {
    it('should navigate to /addPost', () => {
      component.navigateToAddPost();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/addPost']);
    });
  });

  describe('navigateToUnderReview', () => {
    it('should navigate to /under-review', () => {
      component.navigateToUnderReview();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/under-review']);
    });
  });
});
