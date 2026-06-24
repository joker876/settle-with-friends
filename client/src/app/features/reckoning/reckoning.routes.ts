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
    data: {
      isCreateMode: true,
    },
  },
  {
    path: 'transaction/:transactionId',
    loadComponent: () =>
      import('./views/create-transaction/create-transaction.view').then(m => m.CreateTransactionView),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./views/transaction-list/transaction-list.view').then(m => m.TransactionListView),
  },
];
