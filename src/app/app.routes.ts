import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/free-play/free-play.component').then((m) => m.FreePlayComponent), data: { title: 'Playful learning for little hands', description: 'A gentle, offline-first world of playful games, music and discovery for little hands.' } },
  { path: 'games', loadComponent: () => import('./features/wiggle-pop-games/wiggle-pop-games.component').then((m) => m.WigglePopGamesComponent), data: { title: 'Games for little hands', description: 'Explore friendly games made for curious hands and bright ideas.' } },
  { path: 'games/tile-memory', loadComponent: () => import('./features/tile-memory/tile-memory.component').then((m) => m.TileMemoryComponent), data: { title: 'Tile Memory game', description: 'Turn over friendly animals and find their matching friend.' } },
  { path: 'games/find-it', loadComponent: () => import('./features/find-it/find-it.component').then((m) => m.FindItComponent), data: { title: 'Find It game', description: 'Find the matching animal in a playful picture hunt.' } },
  { path: 'games/balloon-pop', loadComponent: () => import('./features/balloon-pop/balloon-pop.component').then((m) => m.BalloonPopComponent), data: { title: 'Balloon Pop game', description: 'Pop colourful balloons in a gentle keyboard game.' } },
  { path: 'games/pattern-pop', loadComponent: () => import('./features/pattern-pop/pattern-pop.component').then((m) => m.PatternPopComponent), data: { title: 'Pattern Pop game', description: 'Spot what comes next in colourful little patterns.' } },
  { path: 'games/feed-the-monster', loadComponent: () => import('./features/feed-the-monster/feed-the-monster.component').then((m) => m.FeedTheMonsterComponent), data: { title: 'Feed the Monster game', description: 'Drag the right snack to a goofy hungry monster.' } },
  { path: 'games/xylophone', loadComponent: () => import('./features/xylophone/xylophone.component').then((m) => m.XylophoneComponent), data: { title: 'Twinkle Xylophone game', description: 'Listen and follow glowing notes to make a tiny tune.' } },
  { path: 'games/colour-splash', loadComponent: () => import('./features/colour-splash/colour-splash.component').then((m) => m.ColourSplashComponent), data: { title: 'Colour Splash game', description: 'Tap and make your very own colourful picture.' } },
  { path: 'games/color-match', loadComponent: () => import('./features/color-match/color-match.component').then((m) => m.ColorMatchComponent), data: { title: 'Color Match game', description: 'Match colourful little objects to their basket.' } },
  { path: 'bible-stories', loadComponent: () => import('./features/bible-stories/bible-stories.component').then((m) => m.BibleStoriesComponent), data: { title: 'Bible Stories', description: 'Gentle Bible stories filled with courage, kindness, wonder and hope.', robots: 'noindex,follow' } },
  { path: 'for-parents', loadComponent: () => import('./features/for-parents/for-parents.component').then((m) => m.ForParentsComponent), data: { title: 'For Parents', description: 'Learn about Wiggle Pop’s calm, simple and child-first play experience.' } },
  { path: '**', redirectTo: '' }
];
