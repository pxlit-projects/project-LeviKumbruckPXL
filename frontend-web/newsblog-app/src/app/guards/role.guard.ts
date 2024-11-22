import { Injectable } from '@angular/core';
import { CanActivate} from '@angular/router';
import { AuthService } from '../shared/services/authService/auth.service';

@Injectable({
  providedIn: 'root',
})


export class isRedactorGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate(): boolean {
    const role = this.authService.getRole();
    if (role !== 'redactor') {
      return false;
    }
    return true;
  }
}
