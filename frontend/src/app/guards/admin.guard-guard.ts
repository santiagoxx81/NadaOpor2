import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const raw = localStorage.getItem('usuario');
  try {
    const usuario = raw ? JSON.parse(raw) : null;
    if (usuario?.tipo_usuario === 'ADMIN') return true;
  } catch {}
  router.navigate(['/login']);
  
  return false;
};
