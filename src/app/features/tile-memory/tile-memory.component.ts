import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioService } from '../../core/services/audio.service';
import { ANIMALS } from '../../content/animals';

type GameAge = '2-3' | '4-5' | '6+';
interface Card { readonly id: number; readonly animal: string; readonly name: string; readonly faceUp: boolean; readonly matched: boolean; }

const LEVELS: Record<GameAge, { readonly label: string; readonly pairs: number; readonly columns: number }> = {
  '2-3': { label: 'Ages 2–3', pairs: 2, columns: 2 },
  '4-5': { label: 'Ages 4–5', pairs: 6, columns: 4 },
  '6+': { label: 'Ages 6+', pairs: 8, columns: 4 }
};

@Component({
  selector: 'app-tile-memory',
  imports: [RouterLink],
  templateUrl: './tile-memory.component.html',
  styleUrl: './tile-memory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileMemoryComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly audio = inject(AudioService);
  private readonly subscription = new Subscription();
  private mismatchTimer?: ReturnType<typeof setTimeout>;
  readonly age = signal<GameAge>('4-5');
  readonly cards = signal<readonly Card[]>([]);
  readonly locked = signal(false);
  readonly complete = signal(false);
  readonly level = computed(() => LEVELS[this.age()]);

  constructor() {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => {
      const requestedAge = params.get('age');
      const age: GameAge = requestedAge === '2-3' || requestedAge === '6+' || requestedAge === '4-5' ? requestedAge : '4-5';
      this.age.set(age);
      this.startNewGame();
    }));
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); if (this.mismatchTimer) clearTimeout(this.mismatchTimer); }

  reveal(card: Card): void {
    if (this.locked() || this.complete() || card.faceUp || card.matched) return;
    this.audio.playPop();
    this.cards.update((cards) => cards.map((item) => item.id === card.id ? { ...item, faceUp: true } : item));
    const openCards = this.cards().filter((item) => item.faceUp && !item.matched);
    if (openCards.length !== 2) return;
    if (openCards[0].animal === openCards[1].animal) {
      this.cards.update((cards) => cards.map((item) => item.id === openCards[0].id || item.id === openCards[1].id ? { ...item, matched: true } : item));
      this.audio.playPop();
      if (this.cards().every((item) => item.matched)) this.complete.set(true);
      return;
    }
    this.locked.set(true);
    this.mismatchTimer = setTimeout(() => {
      const openIds = new Set(openCards.map((item) => item.id));
      this.cards.update((cards) => cards.map((item) => openIds.has(item.id) ? { ...item, faceUp: false } : item));
      this.locked.set(false);
      this.mismatchTimer = undefined;
    }, 720);
  }

  startNewGame(): void {
    if (this.mismatchTimer) clearTimeout(this.mismatchTimer);
    this.mismatchTimer = undefined;
    this.locked.set(false);
    this.complete.set(false);
    const animals = ANIMALS.slice(0, LEVELS[this.age()].pairs);
    const cards = animals.flatMap((item, pairId) => [0, 1].map((copy) => ({ id: pairId * 2 + copy, animal: item.emoji, name: item.name, faceUp: false, matched: false })));
    this.cards.set(this.shuffle(cards));
  }

  private shuffle(cards: Card[]): Card[] {
    for (let index = cards.length - 1; index > 0; index--) {
      const next = Math.floor(Math.random() * (index + 1));
      [cards[index], cards[next]] = [cards[next], cards[index]];
    }
    return cards;
  }
}
