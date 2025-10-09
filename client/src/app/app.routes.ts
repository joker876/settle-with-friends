import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then(c => c.LoginPage),
    loadChildren: () => import('./features/login/login.routes').then(c => c.loginRoutes),
  },
];
