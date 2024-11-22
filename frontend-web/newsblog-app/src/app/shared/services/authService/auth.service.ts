import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: { username: string; role: string } | null = null;

  constructor() {}

  login(username: string, role: string): void {
    this.currentUser = { username, role };
    sessionStorage.setItem('user', JSON.stringify(this.currentUser));
  }

  logout(): void {
    this.currentUser = null;
    sessionStorage.removeItem('user');
  }

  getUser(): { username: string; role: string } | null {
    if (!this.currentUser) {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
    return this.currentUser;
  }

  getRole(): string | null {
    return this.currentUser ? this.currentUser.role : null;
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  
}
