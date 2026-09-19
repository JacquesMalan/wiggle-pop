import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import lottie, { AnimationItem } from 'lottie-web';
import { AudioService } from '../../core/services/audio.service';

interface Snack { readonly id: string; readonly emoji: string; readonly label: string; readonly count: number; readonly colour: string; }
interface Round { readonly prompt: string; readonly targetId: string; readonly snacks: readonly Snack[]; }

const ROUNDS: readonly Round[] = [
  { prompt: 'Feed me something BLUE!', targetId: 'blueberry', snacks: [
    { id: 'blueberry', emoji: '🫐', label: 'blue berries', count: 1, colour: 'blue' }, { id: 'apple', emoji: '🍎', label: 'apple', count: 1, colour: 'red' }, { id: 'banana', emoji: '🍌', label: 'banana', count: 1, colour: 'yellow' }, { id: 'grapes', emoji: '🍇', label: 'grapes', count: 1, colour: 'purple' }
  ] },
  { prompt: 'Feed me 3 apples!', targetId: 'three-apples', snacks: [
    { id: 'two-apples', emoji: '🍎🍎', label: 'two apples', count: 2, colour: 'red' }, { id: 'three-apples', emoji: '🍎\n🍎🍎', label: 'three apples', count: 3, colour: 'red' }, { id: 'four-apples', emoji: '🍎\n🍎🍎\n🍎', label: 'four apples', count: 4, colour: 'red' }, { id: 'one-apple', emoji: '🍎', label: 'one apple', count: 1, colour: 'red' }
  ] },
  { prompt: 'Feed me something GREEN!', targetId: 'pear', snacks: [
    { id: 'pear', emoji: '🍐', label: 'pear', count: 1, colour: 'green' }, { id: 'orange', emoji: '🍊', label: 'orange', count: 1, colour: 'orange' }, { id: 'cherries', emoji: '🍒', label: 'cherries', count: 1, colour: 'red' }, { id: 'blueberry', emoji: '🫐', label: 'blue berries', count: 1, colour: 'blue' }
  ] },
  { prompt: 'Feed me 2 bananas!', targetId: 'two-bananas', snacks: [
    { id: 'one-banana', emoji: '🍌', label: 'one banana', count: 1, colour: 'yellow' }, { id: 'two-bananas', emoji: '🍌🍌', label: 'two bananas', count: 2, colour: 'yellow' }, { id: 'three-bananas', emoji: '🍌\n🍌🍌', label: 'three bananas', count: 3, colour: 'yellow' }, { id: 'four-bananas', emoji: '🍌\n🍌🍌\n🍌', label: 'four bananas', count: 4, colour: 'yellow' }
  ] },
  { prompt: 'Feed me something RED!', targetId: 'strawberry', snacks: [
    { id: 'strawberry', emoji: '🍓', label: 'strawberry', count: 1, colour: 'red' }, { id: 'kiwi', emoji: '🥝', label: 'kiwi', count: 1, colour: 'green' }, { id: 'blueberry', emoji: '🫐', label: 'blue berries', count: 1, colour: 'blue' }, { id: 'banana', emoji: '🍌', label: 'banana', count: 1, colour: 'yellow' }
  ] }
];

@Component({ selector: 'app-feed-the-monster', imports: [RouterLink], templateUrl: './feed-the-monster.component.html', styleUrl: './feed-the-monster.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class FeedTheMonsterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('monsterAnimation', { static: true }) private readonly monsterAnimation!: ElementRef<HTMLElement>;
  @ViewChild('monsterDropzone', { static: true }) private readonly monsterDropzone!: ElementRef<HTMLElement>;
  private readonly audio = inject(AudioService);
  private animation?: AnimationItem;
  private chewTimer?: ReturnType<typeof setTimeout>;
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private pointerId?: number;
  readonly roundIndex = signal(0);
  readonly draggedId = signal<string | undefined>(undefined);
  readonly dragPosition = signal<{ x: number; y: number } | undefined>(undefined);
  readonly feeding = signal(false);
  readonly wobblyId = signal<string | undefined>(undefined);
  readonly complete = signal(false);
  readonly round = computed(() => ROUNDS[this.roundIndex()]);
  readonly roundNumber = computed(() => this.roundIndex() + 1);
  readonly draggedSnack = computed(() => this.round().snacks.find((snack) => snack.id === this.draggedId()));

  ngAfterViewInit(): void {
    this.animation = lottie.loadAnimation({ container: this.monsterAnimation.nativeElement, renderer: 'svg', loop: false, autoplay: false, path: 'assets/animations/red-monster.json', rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
    this.animation.addEventListener('DOMLoaded', () => this.setMouthClosed());
  }

  ngOnDestroy(): void {
    this.animation?.destroy();
    if (this.chewTimer) clearTimeout(this.chewTimer);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }

  startDrag(event: PointerEvent, snack: Snack): void {
    if (this.feeding() || this.complete()) return;
    event.preventDefault();
    this.pointerId = event.pointerId;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.draggedId.set(snack.id);
    this.dragPosition.set({ x: event.clientX, y: event.clientY });
    this.setMouthOpen();
  }

  moveDrag(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId || !this.draggedId()) return;
    this.dragPosition.set({ x: event.clientX, y: event.clientY });
  }

  endDrag(event: PointerEvent): void {
    if (event.pointerId !== this.pointerId) return;
    const snack = this.round().snacks.find((item) => item.id === this.draggedId());
    const droppedOnMonster = this.isOverMonster(event.clientX, event.clientY);
    this.pointerId = undefined;
    this.draggedId.set(undefined);
    this.dragPosition.set(undefined);
    if (!snack || !droppedOnMonster) { this.setMouthClosed(); return; }
    if (snack.id !== this.round().targetId) {
      this.wobblyId.set(snack.id);
      setTimeout(() => this.wobblyId.set(undefined), 450);
      this.setMouthClosed();
      return;
    }
    this.feed();
  }

  playAgain(): void {
    if (this.chewTimer) clearTimeout(this.chewTimer);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.roundIndex.set(0);
    this.complete.set(false);
    this.feeding.set(false);
    this.setMouthClosed();
  }

  private feed(): void {
    this.feeding.set(true);
    this.audio.playPop();
    this.animation?.playSegments([9, 29], true);
    this.chewTimer = setTimeout(() => {
      this.chewTimer = undefined;
      this.setMouthClosed();
      if (this.roundIndex() === ROUNDS.length - 1) { this.complete.set(true); return; }
      this.roundIndex.update((index) => index + 1);
      this.feeding.set(false);
    }, 2400);
  }

  private isOverMonster(x: number, y: number): boolean {
    const bounds = this.monsterDropzone.nativeElement.getBoundingClientRect();
    return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
  }

  private setMouthOpen(): void {
    this.animation?.pause();
    this.animation?.goToAndStop(11, true);
  }

  private setMouthClosed(): void {
    this.animation?.pause();
    this.animation?.goToAndStop(0, true);
  }
}
