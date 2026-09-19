import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioService } from '../../core/services/audio.service';

type GameAge = '4-5' | '6+';
type PatternKind = 'Colours' | 'Shapes' | 'Objects';

interface PatternRound {
  readonly kind: PatternKind;
  readonly sequence: readonly string[];
  readonly answer: string;
  readonly options: readonly string[];
}

const ROUNDS: readonly PatternRound[] = [
  { kind: 'Colours', sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🟡', '🟢'] },
  { kind: 'Colours', sequence: ['🟡', '🟡', '🟣', '🟡', '🟡'], answer: '🟣', options: ['🔵', '🟣', '🟢'] },
  { kind: 'Shapes', sequence: ['▲', '●', '▲', '●'], answer: '▲', options: ['■', '▲', '◆'] },
  { kind: 'Shapes', sequence: ['■', '■', '●', '■', '■'], answer: '●', options: ['▲', '●', '◆'] },
  { kind: 'Objects', sequence: ['🍎', '🍌', '🍎', '🍌'], answer: '🍎', options: ['🍎', '🍓', '🍇'] },
  { kind: 'Objects', sequence: ['🚗', '🚌', '🚌', '🚗', '🚌', '🚌'], answer: '🚗', options: ['🚕', '🚗', '🚲'] }
];

const LEVEL_LABELS: Record<GameAge, string> = { '4-5': 'Ages 4–5', '6+': 'Ages 6+' };

@Component({
  selector: 'app-pattern-pop',
  imports: [RouterLink],
  templateUrl: './pattern-pop.component.html',
  styleUrl: './pattern-pop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatternPopComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly audio = inject(AudioService);
  private readonly subscription = new Subscription();
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private wobbleTimer?: ReturnType<typeof setTimeout>;
  readonly age = signal<GameAge>('4-5');
  readonly roundIndex = signal(0);
  readonly options = signal<readonly string[]>([]);
  readonly locked = signal(false);
  readonly complete = signal(false);
  readonly correctOption = signal<string | undefined>(undefined);
  readonly wobblyOption = signal<string | undefined>(undefined);
  readonly round = computed(() => ROUNDS[this.roundIndex()]);
  readonly roundNumber = computed(() => this.roundIndex() + 1);
  readonly levelLabel = computed(() => LEVEL_LABELS[this.age()]);

  constructor() {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => {
      this.age.set(params.get('age') === '6+' ? '6+' : '4-5');
      this.startNewGame();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (this.locked() || this.complete() || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const option = this.options()[Number(event.key) - 1];
    if (!option) return;
    event.preventDefault();
    this.choose(option);
  }

  choose(option: string): void {
    if (this.locked() || this.complete()) return;
    if (option !== this.round().answer) {
      this.wobblyOption.set(option);
      if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
      this.wobbleTimer = setTimeout(() => { this.wobblyOption.set(undefined); this.wobbleTimer = undefined; }, 460);
      return;
    }
    this.locked.set(true);
    this.correctOption.set(option);
    this.audio.playPop();
    this.transitionTimer = setTimeout(() => {
      this.transitionTimer = undefined;
      this.correctOption.set(undefined);
      if (this.roundIndex() === ROUNDS.length - 1) {
        this.complete.set(true);
        return;
      }
      this.roundIndex.update((index) => index + 1);
      this.options.set(this.shuffle(this.round().options));
      this.locked.set(false);
    }, 620);
  }

  startNewGame(): void {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
    this.transitionTimer = undefined;
    this.wobbleTimer = undefined;
    this.roundIndex.set(0);
    this.complete.set(false);
    this.locked.set(false);
    this.correctOption.set(undefined);
    this.wobblyOption.set(undefined);
    this.options.set(this.shuffle(this.round().options));
  }

  private shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const next = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[next]] = [shuffled[next], shuffled[index]];
    }
    return shuffled;
  }
}
