import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ANIMALS, Animal } from '../../content/animals';
import { AudioService } from '../../core/services/audio.service';

type GameAge = '4-5' | '6+';

const LEVELS: Record<GameAge, { readonly label: string; readonly choices: number }> = {
  '4-5': { label: 'Ages 4–5', choices: 4 },
  '6+': { label: 'Ages 6+', choices: 6 }
};

@Component({
  selector: 'app-find-it',
  imports: [RouterLink],
  templateUrl: './find-it.component.html',
  styleUrl: './find-it.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindItComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly audio = inject(AudioService);
  private readonly subscription = new Subscription();
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private wobbleTimer?: ReturnType<typeof setTimeout>;
  private previousTargetId?: string;
  readonly age = signal<GameAge>('4-5');
  readonly round = signal(1);
  readonly target = signal<Animal | undefined>(undefined);
  readonly choices = signal<readonly Animal[]>([]);
  readonly locked = signal(false);
  readonly complete = signal(false);
  readonly correctId = signal<string | undefined>(undefined);
  readonly wobblyId = signal<string | undefined>(undefined);
  readonly level = computed(() => LEVELS[this.age()]);

  constructor() {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => {
      const requestedAge = params.get('age');
      this.age.set(requestedAge === '6+' ? '6+' : '4-5');
      this.startNewGame();
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
  }

  choose(animal: Animal): void {
    if (this.locked() || this.complete()) return;
    if (animal.id !== this.target()?.id) {
      this.wobblyId.set(animal.id);
      if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
      this.wobbleTimer = setTimeout(() => { this.wobblyId.set(undefined); this.wobbleTimer = undefined; }, 460);
      return;
    }
    this.locked.set(true);
    this.correctId.set(animal.id);
    this.audio.playPop();
    this.transitionTimer = setTimeout(() => {
      this.transitionTimer = undefined;
      this.correctId.set(undefined);
      if (this.round() === 5) {
        this.complete.set(true);
        return;
      }
      this.round.update((round) => round + 1);
      this.setRound();
      this.locked.set(false);
    }, 620);
  }

  startNewGame(): void {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    if (this.wobbleTimer) clearTimeout(this.wobbleTimer);
    this.transitionTimer = undefined;
    this.wobbleTimer = undefined;
    this.previousTargetId = undefined;
    this.round.set(1);
    this.complete.set(false);
    this.locked.set(false);
    this.correctId.set(undefined);
    this.wobblyId.set(undefined);
    this.setRound();
  }

  private setRound(): void {
    const targets = ANIMALS.filter((animal) => animal.id !== this.previousTargetId);
    const target = targets[Math.floor(Math.random() * targets.length)];
    const distractors = this.shuffle(ANIMALS.filter((animal) => animal.id !== target.id)).slice(0, this.level().choices - 1);
    this.previousTargetId = target.id;
    this.target.set(target);
    this.choices.set(this.shuffle([target, ...distractors]));
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
