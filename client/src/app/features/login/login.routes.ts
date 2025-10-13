import { Routes } from '@angular/router';
import { LoginView } from './views/login/login.view';
import { RegisterImpossibleView } from './views/register-impossible/register-impossible.view';
import { RegisterView } from './views/register/register.view';

export const loginRoutes: Routes = [
  { path: '', component: LoginView },
  { path: 'register', component: RegisterView },
  { path: 'register-impossible', component: RegisterImpossibleView },
];
