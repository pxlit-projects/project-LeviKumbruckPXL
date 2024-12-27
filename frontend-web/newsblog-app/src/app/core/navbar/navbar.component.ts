import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/authService/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  userRole: string | null = null;
  currentRoute ='';

  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);


  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }

    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  navigateToPosts() {
    this.router.navigate(['/posts']); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }

  navigateToAddPost() {
    this.router.navigate(['/addPost']);
  }

  navigateToUnderReview() {
    this.router.navigate(['/under-review']);
  }
  
}
