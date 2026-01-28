import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization (with a short timeout to avoid blocking)
  await new Promise<void>((resolve) => {
    const start = Date.now();
    const check = () => {
      if (!authService.isLoading()) return resolve();
      if (Date.now() - start > 2000) return resolve();
      setTimeout(check, 50);
    };
    check();
  });

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const publicGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization (with a short timeout to avoid blocking)
  await new Promise<void>((resolve) => {
    const start = Date.now();
    const check = () => {
      if (!authService.isLoading()) return resolve();
      if (Date.now() - start > 2000) return resolve();
      setTimeout(check, 50);
    };
    check();
  });

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
