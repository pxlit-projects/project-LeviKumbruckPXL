import { Component, inject } from '@angular/core';
import { AuthService } from '../../shared/services/authService/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  username ='';
  role = '';

  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);

  login(): void {
    if (this.username && this.role) {
      this.authService.login(this.username, this.role);
      if (this.role === 'redactor') {
        this.router.navigate(['/addPost']); 
      } else {
        this.router.navigate(['/posts']);
      }
    }
  }
}