import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/free-play/free-play.component').then((m) => m.FreePlayComponent) },
  { path: 'games', loadComponent: () => import('./features/wiggle-pop-games/wiggle-pop-games.component').then((m) => m.WigglePopGamesComponent) },
  { path: 'games/tile-memory', loadComponent: () => import('./features/tile-memory/tile-memory.component').then((m) => m.TileMemoryComponent) },
  { path: 'games/find-it', loadComponent: () => import('./features/find-it/find-it.component').then((m) => m.FindItComponent) },
  { path: 'games/balloon-pop', loadComponent: () => import('./features/balloon-pop/balloon-pop.component').then((m) => m.BalloonPopComponent) },
  { path: 'games/pattern-pop', loadComponent: () => import('./features/pattern-pop/pattern-pop.component').then((m) => m.PatternPopComponent) },
  { path: 'games/feed-the-monster', loadComponent: () => import('./features/feed-the-monster/feed-the-monster.component').then((m) => m.FeedTheMonsterComponent) },
  { path: 'games/xylophone', loadComponent: () => import('./features/xylophone/xylophone.component').then((m) => m.XylophoneComponent) },
  { path: 'games/colour-splash', loadComponent: () => import('./features/colour-splash/colour-splash.component').then((m) => m.ColourSplashComponent) },
  { path: 'bible-stories', loadComponent: () => import('./features/bible-stories/bible-stories.component').then((m) => m.BibleStoriesComponent) },
  { path: 'for-parents', loadComponent: () => import('./features/for-parents/for-parents.component').then((m) => m.ForParentsComponent) },
  { path: '**', redirectTo: '' }
];
