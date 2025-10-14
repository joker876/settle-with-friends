import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then(c => c.LoginPage),
    loadChildren: () => import('./features/login/login.routes').then(r => r.loginRoutes),
  },
  {
    path: '',
    loadComponent: () => import('./features/main/main.page').then(c => c.MainPage),
    loadChildren: () => import('./features/main/main.routes').then(r => r.mainRoutes),
  },
];
