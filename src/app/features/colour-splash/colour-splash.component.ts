import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AudioService } from '../../core/services/audio.service';
import { InteractionService } from '../../core/services/interaction.service';

type MarkKind = 'splat' | 'dot' | 'star' | 'heart' | 'hand';
interface SplashMark {
  readonly id: number;
  readonly kind: MarkKind;
  readonly symbol: string;
  readonly colour: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: string;
  readonly size: number;
}

const MARKS: readonly { readonly kind: MarkKind; readonly symbol: string }[] = [
  { kind: 'splat', symbol: '✹' }, { kind: 'dot', symbol: '●' }, { kind: 'star', symbol: '★' },
  { kind: 'heart', symbol: '♥' }, { kind: 'hand', symbol: '✋' }
];
const COLOURS = ['#f45a8a', '#ffad4c', '#ffe05d', '#55d6be', '#5da4f3', '#a987f2'];
const MAX_MARKS = 120;

@Component({
  selector: 'app-colour-splash',
  imports: [RouterLink],
  templateUrl: './colour-splash.component.html',
  styleUrl: './colour-splash.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColourSplashComponent implements AfterViewInit, OnDestroy {
  @ViewChild('artwork', { static: true }) private readonly artwork!: ElementRef<HTMLElement>;
  private readonly interaction = inject(InteractionService);
  private readonly audio = inject(AudioService);
  private readonly subscriptions = new Subscription();
  private unbind?: () => void;
  private nextMarkId = 0;
  readonly marks = signal<readonly SplashMark[]>([]);

  ngAfterViewInit(): void {
    this.unbind = this.interaction.bind(this.artwork.nativeElement);
    this.subscriptions.add(this.interaction.pointerDown$.subscribe((event) => this.addMark(event.x, event.y)));
    this.subscriptions.add(this.interaction.keyDown$.subscribe((event) => {
      if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
      const stage = this.artwork.nativeElement;
      this.addMark(stage.clientWidth * (.12 + Math.random() * .76), stage.clientHeight * (.12 + Math.random() * .76));
    }));
  }

  ngOnDestroy(): void { this.unbind?.(); this.subscriptions.unsubscribe(); }

  clearArtwork(): void { this.marks.set([]); }

  private addMark(x: number, y: number): void {
    const stage = this.artwork.nativeElement;
    const mark = MARKS[Math.floor(Math.random() * MARKS.length)];
    this.audio.playPop();
    this.marks.update((marks) => [...marks.slice(-(MAX_MARKS - 1)), {
      id: this.nextMarkId++, kind: mark.kind, symbol: mark.symbol,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      x: Math.min(94, Math.max(6, x / stage.clientWidth * 100)),
      y: Math.min(91, Math.max(9, y / stage.clientHeight * 100)),
      rotation: `${Math.round((Math.random() - .5) * 28)}deg`, size: 50 + Math.round(Math.random() * 35)
    }]);
  }
}
