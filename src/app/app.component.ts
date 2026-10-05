import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly siteUrl = 'https://toddlerplay.co.za';

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.updateMetadata());
    this.updateMetadata();
  }

  private updateMetadata(): void {
    let activeRoute = this.route;
    while (activeRoute.firstChild) activeRoute = activeRoute.firstChild;

    const metadata = activeRoute.snapshot.data;
    const pageTitle = metadata['title'] ?? 'Playful learning for little hands';
    const description = metadata['description'] ?? 'A gentle, offline-first world of playful games, music and discovery for little hands.';
    const robots = metadata['robots'] ?? 'index,follow';
    const canonicalUrl = `${this.siteUrl}${this.router.url.split('?')[0]}`;

    this.title.setTitle(`${pageTitle} | Wiggle Pop`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:title', content: `${pageTitle} | Wiggle Pop` });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: `${pageTitle} | Wiggle Pop` });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
  }
}
