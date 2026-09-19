import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'wiggle-pop-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly darkMode = signal(false);

  constructor() {
    let savedTheme: string | null = null;
    try { savedTheme = localStorage.getItem(THEME_STORAGE_KEY); } catch { /* Storage can be unavailable in embedded browsers. */ }
    this.setDarkMode(savedTheme === 'true');
  }

  toggle(): void { this.setDarkMode(!this.darkMode()); }

  private setDarkMode(enabled: boolean): void {
    this.darkMode.set(enabled);
    this.document.documentElement.classList.toggle('dark-mode', enabled);
    try { localStorage.setItem(THEME_STORAGE_KEY, String(enabled)); } catch { /* The visual state still works without persistence. */ }
  }
}
