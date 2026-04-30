import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // OPTIONAL: decode role (simple version)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.role === 'admin') {
      return true;
    }

    // block non-admin from admin routes
    if (window.location.pathname.includes('/admin')) {
      router.navigate(['/']);
      return false;
    }

    return true;

  } catch {
    router.navigate(['/login']);
    return false;
  }
};