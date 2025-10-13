import { Routes } from '@angular/router';
import { LoginView } from './views/login/login.view';
import { RegisterView } from './views/register/register.view';

export const loginRoutes: Routes = [
  { path: '', component: LoginView },
  { path: 'register', component: RegisterView },
];
