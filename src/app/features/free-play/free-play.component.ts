import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RAINBOW_THEME } from '../../content/themes';
import { ParticleEngine } from '../../core/engines/particle-engine';
import { AudioService } from '../../core/services/audio.service';
import { InteractionService } from '../../core/services/interaction.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-free-play',
  imports: [RouterLink],
  templateUrl: './free-play.component.html',
  styleUrl: './free-play.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FreePlayComponent implements AfterViewInit, OnDestroy {
  private static readonly PLAY_EMOJIS = ['🌈', '⭐', '🫧', '🦄', '🐸', '🦁', '🚀', '🌸', '🍭', '🎈', '🧸', '✨'];
  private static readonly SCORE_MOODS = ['Little chaos', 'Getting serious', 'Bigger smash', 'Mega mash', 'Smash legend'];
  @ViewChild('playground', { static: true }) private readonly playground!: ElementRef<HTMLElement>;
  @ViewChild('canvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mobileKeyboard', { static: true }) private readonly mobileKeyboard!: ElementRef<HTMLInputElement>;
  private readonly interaction = inject(InteractionService);
  private readonly audio = inject(AudioService);
  readonly theme = inject(ThemeService);
  private readonly engine = new ParticleEngine();
  private readonly subscriptions = new Subscription();
  private unbind?: () => void;
  private lastTrailAt = 0;
  readonly welcomeVisible = signal(true);
  readonly keysMashed = signal(0);
  readonly scoreMood = computed(() => FreePlayComponent.SCORE_MOODS[Math.min(Math.floor(this.keysMashed() / 50), FreePlayComponent.SCORE_MOODS.length - 1)]);
  readonly scoreScale = computed(() => '1');
  readonly scorePopping = signal(false);
  readonly smashedLetters = signal<ReadonlyArray<{ id: number; value: string; x: number; y: number; colour: string; rotation: string; kind: 'magnet' | 'emoji' }>>([]);
  private nextLetterId = 0;
  private readonly letterTimers = new Set<ReturnType<typeof setTimeout>>();
  private scorePopTimer?: ReturnType<typeof setTimeout>;
  private parentSequence = '';

  ngAfterViewInit(): void {
    this.engine.initialize(this.canvas.nativeElement);
    this.unbind = this.interaction.bind(this.playground.nativeElement);
    this.subscriptions.add(this.interaction.pointerDown$.subscribe((event) => {
      this.engine.burst(event.x, event.y, RAINBOW_THEME);
      this.audio.playPop();
    }));
    this.subscriptions.add(this.interaction.pointerMove$.subscribe((event) => {
      if (event.timeStamp - this.lastTrailAt < 28) return;
      this.lastTrailAt = event.timeStamp;
      this.engine.trail(event.x, event.y, RAINBOW_THEME);
    }));
    this.subscriptions.add(this.interaction.keyDown$.subscribe((event) => {
      if (this.welcomeVisible()) return;
      if (this.checkParentShortcut(event.key)) return;
      const host = this.playground.nativeElement;
      const x = Math.random() * host.clientWidth;
      const y = Math.random() * host.clientHeight;
      this.engine.burst(x, y, RAINBOW_THEME, 7);
      const playableCharacter = this.getPlayableCharacter(event.key, event.code);
      if (playableCharacter) this.showMagnetLetter(playableCharacter, x, y);
      else this.showEmoji(x, y);
      const nextTotal = this.keysMashed() + 1;
      this.keysMashed.set(nextTotal);
      if (nextTotal > 0 && nextTotal % 50 === 0) this.popScoreBadge();
      this.audio.playPop();
    }));
    window.addEventListener('resize', this.resize, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resize);
    this.unbind?.(); this.subscriptions.unsubscribe(); this.engine.dispose();
    this.letterTimers.forEach((timer) => clearTimeout(timer));
    if (this.scorePopTimer) clearTimeout(this.scorePopTimer);
  }

  toggleDarkMode(): void { this.theme.toggle(); }

  startSmashing(event: MouseEvent): void {
    const stage = this.playground.nativeElement;
    const bounds = stage.getBoundingClientRect();
    this.welcomeVisible.set(false);
    this.engine.burst(event.clientX - bounds.left, event.clientY - bounds.top, RAINBOW_THEME, 7);
    this.mobileKeyboard.nativeElement.focus({ preventScroll: true });
    void this.enterFullscreen().finally(() => this.refreshPlaySurface());
  }

  returnHome(): void {
    this.mobileKeyboard.nativeElement.blur();
    this.parentSequence = '';
    this.keysMashed.set(0);
    this.scorePopping.set(false);
    this.smashedLetters.set([]);
    this.engine.dispose();
    this.welcomeVisible.set(true);
    void this.exitFullscreen().finally(() => this.refreshPlaySurface());
  }

  private showMagnetLetter(value: string, x: number, y: number): void {
    const id = this.nextLetterId++;
    const letter = {
      id, value: value.toUpperCase(), x, y,
      colour: RAINBOW_THEME.colours[Math.floor(Math.random() * RAINBOW_THEME.colours.length)],
      rotation: `${Math.round((Math.random() - .5) * 20)}deg`, kind: 'magnet' as const
    };
    this.smashedLetters.update((letters) => [...letters.slice(-11), letter]);
    const timer = setTimeout(() => {
      this.smashedLetters.update((letters) => letters.filter((item) => item.id !== id));
      this.letterTimers.delete(timer);
    }, 1050);
    this.letterTimers.add(timer);
  }

  private showEmoji(x: number, y: number): void {
    const emoji = FreePlayComponent.PLAY_EMOJIS[Math.floor(Math.random() * FreePlayComponent.PLAY_EMOJIS.length)];
    const id = this.nextLetterId++;
    const item = { id, value: emoji, x, y, colour: 'transparent', rotation: `${Math.round((Math.random() - .5) * 24)}deg`, kind: 'emoji' as const };
    this.smashedLetters.update((items) => [...items.slice(-11), item]);
    const timer = setTimeout(() => {
      this.smashedLetters.update((items) => items.filter((entry) => entry.id !== id));
      this.letterTimers.delete(timer);
    }, 1050);
    this.letterTimers.add(timer);
  }

  private getPlayableCharacter(key: string, code: string): string | undefined {
    if (/^[a-z0-9]$/i.test(key)) return key;
    const numpadMatch = /^Numpad([0-9])$/.exec(code);
    return numpadMatch?.[1];
  }

  clearKeyboardInput(): void { this.mobileKeyboard.nativeElement.value = ''; }

  private popScoreBadge(): void {
    this.scorePopping.set(false);
    requestAnimationFrame(() => this.scorePopping.set(true));
    this.scorePopTimer = setTimeout(() => this.scorePopping.set(false), 460);
  }

  private checkParentShortcut(key: string): boolean {
    if (!/^[a-z]$/i.test(key)) return false;
    this.parentSequence = `${this.parentSequence}${key.toLowerCase()}`.slice(-6);
    if (this.parentSequence !== 'parent') return false;
    this.returnHome();
    return true;
  }

  private async enterFullscreen(): Promise<void> {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen is a convenience; some embedded browsers and mobile devices decline it.
    }
  }

  private async exitFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch {
      // Leaving fullscreen is optional and browser-controlled.
    }
  }

  private refreshPlaySurface(): void {
    this.engine.resize();
    requestAnimationFrame(() => this.engine.resize());
  }

  private readonly resize = (): void => this.refreshPlaySurface();
}
