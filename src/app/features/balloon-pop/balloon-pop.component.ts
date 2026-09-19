import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/services/audio.service';

type BalloonKind = 'letter' | 'number';
interface Balloon {
  readonly id: number;
  readonly kind: BalloonKind;
  readonly value: string;
  readonly label: string;
  readonly colour: string;
  readonly left: number;
  readonly duration: number;
  readonly popping: boolean;
}

const BALLOON_COLOURS = ['#f45a8a', '#5da4f3', '#72d9c1', '#a987f2', '#ffad4c'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'P', 'S', 'T'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

@Component({
  selector: 'app-balloon-pop',
  imports: [RouterLink],
  templateUrl: './balloon-pop.component.html',
  styleUrl: './balloon-pop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BalloonPopComponent implements OnDestroy {
  private readonly audio = inject(AudioService);
  private readonly removalTimers = new Set<ReturnType<typeof setTimeout>>();
  private nextId = 0;
  readonly balloons = signal<readonly Balloon[]>([]);
  readonly wave = signal(1);
  readonly balloonsSpawned = signal(0);
  readonly balloonsPopped = signal(0);
  readonly gameStarted = signal(false);
  readonly waveComplete = signal(false);
  readonly waveFailed = signal(false);
  readonly waveTarget = computed(() => this.wave() * 10);
  readonly finalWave = computed(() => this.wave() === 5);

  ngOnDestroy(): void {
    this.removalTimers.forEach((timer) => clearTimeout(timer));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.gameStarted() || this.waveComplete() || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const key = event.key.toUpperCase();
    const matchingBalloon = this.balloons().find((balloon) => balloon.value === key && !balloon.popping);
    if (!matchingBalloon) return;
    event.preventDefault();
    this.pop(matchingBalloon);
  }

  pop(balloon: Balloon): void {
    if (!this.gameStarted() || this.waveComplete() || balloon.popping) return;
    this.audio.playPop();
    const nextPopped = this.balloonsPopped() + 1;
    this.balloonsPopped.set(nextPopped);
    this.balloons.update((balloons) => balloons.map((item) => item.id === balloon.id ? { ...item, popping: true } : item));
    const timer = setTimeout(() => {
      this.balloons.update((balloons) => balloons.filter((item) => item.id !== balloon.id));
      this.removalTimers.delete(timer);
      if (!this.gameStarted() || this.waveComplete()) return;
      if (nextPopped === this.waveTarget()) {
        this.gameStarted.set(false);
        this.waveComplete.set(true);
      } else {
        this.addBalloon();
      }
    }, 330);
    this.removalTimers.add(timer);
  }

  startWave(): void {
    this.removalTimers.forEach((timer) => clearTimeout(timer));
    this.removalTimers.clear();
    this.balloons.set([]);
    this.balloonsSpawned.set(0);
    this.balloonsPopped.set(0);
    this.waveComplete.set(false);
    this.waveFailed.set(false);
    this.gameStarted.set(true);
    for (let index = 0; index < 4; index++) this.addBalloon();
  }

  nextWave(): void {
    if (this.finalWave()) return;
    this.wave.update((wave) => wave + 1);
    this.startWave();
  }

  playAgain(): void {
    this.wave.set(1);
    this.startWave();
  }

  balloonEscaped(balloon: Balloon): void {
    if (!this.gameStarted() || balloon.popping) return;
    this.gameStarted.set(false);
    this.waveFailed.set(true);
    this.balloons.set([]);
  }

  private addBalloon(): void {
    if (!this.gameStarted() || this.balloonsSpawned() >= this.waveTarget()) return;
    const kind = (['letter', 'number'] as const)[Math.floor(Math.random() * 2)];
    const values = kind === 'letter' ? LETTERS : NUMBERS;
    const value = values[Math.floor(Math.random() * values.length)];
    this.balloons.update((balloons) => [...balloons, {
      id: this.nextId++, kind, value, label: value, colour: BALLOON_COLOURS[Math.floor(Math.random() * BALLOON_COLOURS.length)],
      left: 5 + Math.floor(Math.random() * 84), duration: 7 + Math.floor(Math.random() * 5), popping: false
    }]);
    this.balloonsSpawned.update((count) => count + 1);
  }
}
