import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/free-play/free-play.component').then((m) => m.FreePlayComponent) },
  { path: '**', redirectTo: '' }
];
