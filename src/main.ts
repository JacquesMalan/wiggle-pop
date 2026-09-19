import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideIonicAngular(), provideRouter(appRoutes)]
}).catch((error: unknown) => console.error('Wiggle Pop could not start.', error));
