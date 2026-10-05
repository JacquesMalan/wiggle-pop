import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AudioService } from '../../core/services/audio.service';

interface Colour { readonly id: 'pink' | 'blue' | 'yellow' | 'green' | 'purple'; readonly label: string; readonly fill: string; readonly shade: string; }
interface Round { readonly object: string; readonly target: Colour; readonly distractor: Colour; }

const COLOURS: Record<Colour['id'], Colour> = {
  pink: { id: 'pink', label: 'Pink', fill: '#f3a2b6', shade: '#c86b88' }, blue: { id: 'blue', label: 'Blue', fill: '#8cc9ec', shade: '#4f92ba' }, yellow: { id: 'yellow', label: 'Yellow', fill: '#f8d86e', shade: '#c9a841' }, green: { id: 'green', label: 'Green', fill: '#91d2a6', shade: '#56966b' }, purple: { id: 'purple', label: 'Purple', fill: '#bba4e6', shade: '#8167ae' }
};
const ROUNDS: readonly Round[] = [
  { object: 'little leaf', target: COLOURS.pink, distractor: COLOURS.blue }, { object: 'little leaf', target: COLOURS.blue, distractor: COLOURS.yellow }, { object: 'little leaf', target: COLOURS.yellow, distractor: COLOURS.green }, { object: 'little leaf', target: COLOURS.green, distractor: COLOURS.purple }, { object: 'little leaf', target: COLOURS.purple, distractor: COLOURS.pink }
];

@Component({ selector: 'app-color-match', imports: [RouterLink], templateUrl: './color-match.component.html', styleUrl: './color-match.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ColorMatchComponent implements OnDestroy {
  private readonly audio = inject(AudioService);
  private advanceTimer?: ReturnType<typeof setTimeout>;
  private wobbleTimer?: ReturnType<typeof setTimeout>;
  private draggingPointerId?: number;
  readonly roundIndex = signal(0);
  readonly baskets = signal<readonly Colour[]>([]);
  readonly dragging = signal(false);
  readonly dragPosition = signal<{ x: number; y: number } | undefined>(undefined);
  readonly locked = signal(false);
  readonly acceptedBasketId = signal<Colour['id'] | undefined>(undefined);
  readonly wobblyBasketId = signal<Colour['id'] | undefined>(undefined);
  readonly complete = signal(false);
  readonly round = computed(() => ROUNDS[this.roundIndex()]);
  readonly roundNumber = computed(() => this.roundIndex() + 1);

  constructor() { this.setBaskets(); }
  ngOnDestroy(): void { if (this.advanceTimer) clearTimeout(this.advanceTimer); if (this.wobbleTimer) clearTimeout(this.wobbleTimer); }

  startDrag(event: PointerEvent): void { if (this.locked() || this.complete()) return; event.preventDefault(); this.draggingPointerId = event.pointerId; this.dragging.set(true); this.dragPosition.set({ x: event.clientX, y: event.clientY }); }
  @HostListener('window:pointermove', ['$event']) moveDrag(event: PointerEvent): void { if (event.pointerId === this.draggingPointerId) this.dragPosition.set({ x: event.clientX, y: event.clientY }); }
  @HostListener('window:pointerup', ['$event']) endDrag(event: PointerEvent): void {
    if (event.pointerId !== this.draggingPointerId) return;
    this.draggingPointerId = undefined; this.dragging.set(false); this.dragPosition.set(undefined);
    const basket = (document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null)?.closest<HTMLElement>('[data-basket-id]');
    const basketId = basket?.dataset['basketId'] as Colour['id'] | undefined;
    if (basketId) this.chooseBasket(basketId);
  }
  chooseBasket(basketId: Colour['id']): void {
    if (this.locked() || this.complete()) return;
    if (basketId !== this.round().target.id) { this.wobblyBasketId.set(basketId); if (this.wobbleTimer) clearTimeout(this.wobbleTimer); this.wobbleTimer = setTimeout(() => { this.wobblyBasketId.set(undefined); this.wobbleTimer = undefined; }, 460); return; }
    this.locked.set(true); this.acceptedBasketId.set(basketId); this.audio.playPop();
    this.advanceTimer = setTimeout(() => { this.advanceTimer = undefined; if (this.roundIndex() === ROUNDS.length - 1) { this.complete.set(true); return; } this.roundIndex.update((index) => index + 1); this.acceptedBasketId.set(undefined); this.setBaskets(); this.locked.set(false); }, 850);
  }
  playAgain(): void { if (this.advanceTimer) clearTimeout(this.advanceTimer); if (this.wobbleTimer) clearTimeout(this.wobbleTimer); this.advanceTimer = undefined; this.wobbleTimer = undefined; this.roundIndex.set(0); this.complete.set(false); this.locked.set(false); this.dragging.set(false); this.dragPosition.set(undefined); this.acceptedBasketId.set(undefined); this.wobblyBasketId.set(undefined); this.setBaskets(); }
  private setBaskets(): void { const { target, distractor } = this.round(); this.baskets.set(Math.random() < .5 ? [target, distractor] : [distractor, target]); }
}
