import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface PlayPointerEvent {
  type: 'down' | 'move' | 'up';
  x: number;
  y: number;
  pointerType: string;
  pointerId: number;
  timeStamp: number;
}

export interface PlayKeyEvent {
  key: string;
  code: string;
  timeStamp: number;
}

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly pointerDownSubject = new Subject<PlayPointerEvent>();
  private readonly pointerMoveSubject = new Subject<PlayPointerEvent>();
  private readonly pointerUpSubject = new Subject<PlayPointerEvent>();
  private readonly keyDownSubject = new Subject<PlayKeyEvent>();

  readonly pointerDown$: Observable<PlayPointerEvent> = this.pointerDownSubject.asObservable();
  readonly pointerMove$: Observable<PlayPointerEvent> = this.pointerMoveSubject.asObservable();
  readonly pointerUp$: Observable<PlayPointerEvent> = this.pointerUpSubject.asObservable();
  readonly keyDown$: Observable<PlayKeyEvent> = this.keyDownSubject.asObservable();

  bind(target: HTMLElement): () => void {
    const pointer = (type: PlayPointerEvent['type']) => (event: PointerEvent): void => {
      if (type !== 'move') event.preventDefault();
      const rect = target.getBoundingClientRect();
      const normalized: PlayPointerEvent = {
        type, x: event.clientX - rect.left, y: event.clientY - rect.top,
        pointerType: event.pointerType, pointerId: event.pointerId, timeStamp: event.timeStamp
      };
      if (type === 'down') this.pointerDownSubject.next(normalized);
      if (type === 'move') this.pointerMoveSubject.next(normalized);
      if (type === 'up') this.pointerUpSubject.next(normalized);
    };
    const key = (event: KeyboardEvent): void => {
      // Browser-level function-key shortcuts are unnecessary during play. System and
      // firmware actions (brightness, device lock, etc.) are intentionally outside
      // a web page's control and may not reach this handler.
      if (/^F(?:[1-9]|1[0-2])$/.test(event.key) && event.cancelable) event.preventDefault();
      this.keyDownSubject.next({ key: event.key, code: event.code, timeStamp: event.timeStamp });
    };
    const listeners: ReadonlyArray<readonly [EventTarget, string, EventListener]> = [
      [target, 'pointerdown', pointer('down') as EventListener], [target, 'pointermove', pointer('move') as EventListener],
      [target, 'pointerup', pointer('up') as EventListener], [target, 'pointercancel', pointer('up') as EventListener],
      [window, 'keydown', key as EventListener]
    ];
    listeners.forEach(([node, name, listener]) => node.addEventListener(name, listener, { passive: false }));
    const release = (): void => listeners.forEach(([node, name, listener]) => node.removeEventListener(name, listener));
    this.destroyRef.onDestroy(release);
    return release;
  }
}
