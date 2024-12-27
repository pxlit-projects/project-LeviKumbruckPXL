import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../shared/services/authService/auth.service';

export const isRedactorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const role = authService.getRole();
  return role === 'redactor';
};
