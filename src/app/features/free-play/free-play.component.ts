import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { RAINBOW_THEME } from '../../content/themes';
import { ParticleEngine } from '../../core/engines/particle-engine';
import { AudioService } from '../../core/services/audio.service';
import { InteractionService } from '../../core/services/interaction.service';
import { ThemeService } from '../../core/services/theme.service';

interface ScoreSummary {
  readonly score: number;
  readonly durationSeconds: number;
  readonly chaosLevel: string;
}

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
  readonly scoreSummary = signal<ScoreSummary | undefined>(undefined);
  readonly smashedLetters = signal<ReadonlyArray<{ id: number; value: string; x: number; y: number; colour: string; rotation: string; kind: 'magnet' | 'emoji' }>>([]);
  private nextLetterId = 0;
  private lastKeyboardKey?: { readonly value: string; readonly timeStamp: number };
  private readonly letterTimers = new Set<ReturnType<typeof setTimeout>>();
  private scorePopTimer?: ReturnType<typeof setTimeout>;
  private parentSequence = '';
  private sessionStartedAt?: number;
  private elapsedSessionMs = 0;

  ngAfterViewInit(): void {
    this.engine.initialize(this.canvas.nativeElement);
    this.unbind = this.interaction.bind(this.playground.nativeElement);
    this.subscriptions.add(this.interaction.pointerDown$.subscribe((event) => {
      if (this.welcomeVisible() || this.scoreSummary()) return;
      this.engine.burst(event.x, event.y, RAINBOW_THEME);
      this.audio.unlockXylophone();
      this.audio.playPop();
      this.audio.playInteractionTing(event.timeStamp);
    }));
    this.subscriptions.add(this.interaction.pointerMove$.subscribe((event) => {
      if (this.welcomeVisible() || this.scoreSummary()) return;
      if (event.timeStamp - this.lastTrailAt < 28) return;
      this.lastTrailAt = event.timeStamp;
      this.engine.trail(event.x, event.y, RAINBOW_THEME);
      this.audio.playPointerTing(event.pointerType, event.timeStamp);
    }));
    this.subscriptions.add(this.interaction.keyDown$.subscribe((event) => {
      if (this.welcomeVisible()) return;
      if (this.scoreSummary()) return;
      if (event.key === 'Escape') { this.finishSmashing(); return; }
      this.lastKeyboardKey = /^[a-z0-9]$/i.test(event.key)
        ? { value: event.key.toLowerCase(), timeStamp: event.timeStamp }
        : undefined;
      this.smashCharacter(event.key, event.code, event.timeStamp);
    }));
    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    this.unbind?.(); this.subscriptions.unsubscribe(); this.engine.dispose();
    this.letterTimers.forEach((timer) => clearTimeout(timer));
    if (this.scorePopTimer) clearTimeout(this.scorePopTimer);
  }

  toggleDarkMode(): void { this.theme.toggle(); }

  startSmashing(event: MouseEvent): void {
    const stage = this.playground.nativeElement;
    const bounds = stage.getBoundingClientRect();
    this.welcomeVisible.set(false);
    this.scoreSummary.set(undefined);
    this.sessionStartedAt = performance.now();
    this.elapsedSessionMs = 0;
    this.engine.burst(event.clientX - bounds.left, event.clientY - bounds.top, RAINBOW_THEME, 7);
    this.mobileKeyboard.nativeElement.focus({ preventScroll: true });
    void this.enterFullscreen().finally(() => this.refreshPlaySurface());
  }

  returnHome(): void {
    this.mobileKeyboard.nativeElement.blur();
    this.parentSequence = '';
    this.sessionStartedAt = undefined;
    this.elapsedSessionMs = 0;
    this.keysMashed.set(0);
    this.scorePopping.set(false);
    this.scoreSummary.set(undefined);
    this.smashedLetters.set([]);
    this.engine.dispose();
    this.welcomeVisible.set(true);
    void this.exitFullscreen().finally(() => this.refreshPlaySurface());
  }

  keepSmashing(): void {
    this.scoreSummary.set(undefined);
    this.sessionStartedAt = performance.now();
    this.mobileKeyboard.nativeElement.focus({ preventScroll: true });
    void this.enterFullscreen().finally(() => this.refreshPlaySurface());
  }

  finishSmashing(): void {
    this.captureScoreSummary();
    this.mobileKeyboard.nativeElement.blur();
  }

  private captureScoreSummary(): void {
    if (this.welcomeVisible() || this.scoreSummary() || this.sessionStartedAt === undefined) return;
    this.elapsedSessionMs += performance.now() - this.sessionStartedAt;
    this.scoreSummary.set({
      score: this.keysMashed(),
      durationSeconds: Math.max(1, Math.round(this.elapsedSessionMs / 1000)),
      chaosLevel: this.scoreMood()
    });
    this.sessionStartedAt = undefined;
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

  handleMobileKeyboardInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const inputTime = event.timeStamp;
    const characters = input.value;
    input.value = '';
    if (this.welcomeVisible() || this.scoreSummary()) return;

    this.processMobileCharacters(characters, inputTime);
  }

  handleMobileKeyboardBeforeInput(event: InputEvent): void {
    if (!event.inputType.startsWith('insert') || !event.data) return;
    event.preventDefault();
    if (this.welcomeVisible() || this.scoreSummary()) return;
    this.processMobileCharacters(event.data, event.timeStamp);
  }

  private processMobileCharacters(characters: string, timeStamp: number): void {
    for (const character of characters) {
      const recentlyHandledByKeydown = this.lastKeyboardKey?.value === character.toLowerCase()
        && timeStamp - this.lastKeyboardKey.timeStamp < 120;
      if (recentlyHandledByKeydown) continue;
      this.smashCharacter(character, '', timeStamp);
    }
  }

  private smashCharacter(key: string, code: string, timeStamp: number): void {
    if (this.checkParentShortcut(key)) return;
    const host = this.playground.nativeElement;
    const x = Math.random() * host.clientWidth;
    const y = Math.random() * host.clientHeight;
    this.engine.burst(x, y, RAINBOW_THEME, 7);
    const playableCharacter = this.getPlayableCharacter(key, code);
    if (playableCharacter) this.showMagnetLetter(playableCharacter, x, y);
    else this.showEmoji(x, y);
    const nextTotal = this.keysMashed() + 1;
    this.keysMashed.set(nextTotal);
    if (nextTotal > 0 && nextTotal % 50 === 0) this.popScoreBadge();
    this.audio.playPop();
    this.audio.playInteractionTing(timeStamp);
  }

  private popScoreBadge(): void {
    this.scorePopping.set(false);
    requestAnimationFrame(() => this.scorePopping.set(true));
    this.scorePopTimer = setTimeout(() => this.scorePopping.set(false), 460);
  }

  private checkParentShortcut(key: string): boolean {
    if (!/^[a-z]$/i.test(key)) return false;
    this.parentSequence = `${this.parentSequence}${key.toLowerCase()}`.slice(-6);
    if (this.parentSequence !== 'parent') return false;
    this.finishSmashing();
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

  private readonly handleFullscreenChange = (): void => {
    // Escape is normally consumed by the browser to exit fullscreen, rather than
    // delivered as a keydown event. Treat that browser-level exit as ending play.
    if (!document.fullscreenElement && !this.welcomeVisible()) this.finishSmashing();
  };

  private refreshPlaySurface(): void {
    this.engine.resize();
    requestAnimationFrame(() => this.engine.resize());
  }

  private readonly resize = (): void => this.refreshPlaySurface();
}
