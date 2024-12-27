import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from "./core/notifications/notifications.component";
import { AuthService } from './shared/services/authService/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, NotificationsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  role = '';
  title = 'newsblog-app';

  isLoginPage(): boolean {
    return this.router.url === '/login'; 
  }

  isRedactor(): boolean {
    this.role = this.authService.getRole() ?? '';
    return this.role === 'redactor';
  }
}
