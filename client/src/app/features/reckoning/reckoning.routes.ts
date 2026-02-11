import { Routes } from '@angular/router';
import { ReckoningView } from './views/reckoning/reckoning.view';

export const reckoningRoutes: Routes = [
  {
    path: '',
    component: ReckoningView,
  },
  {
    path: 'create-transaction',
    loadComponent: () =>
      import('./views/create-transaction/create-transaction.view').then(m => m.CreateTransactionView),
  },
];
