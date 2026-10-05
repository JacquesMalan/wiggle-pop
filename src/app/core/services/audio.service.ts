import { Injectable } from '@angular/core';
import * as Tone from 'tone';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private static readonly POINTER_NOTES = ['C5', 'G4', 'E4', 'G4'] as const;
  private context?: AudioContext;
  private lastPlayedAt = 0;
  private lastPointerTingAt = 0;
  private lastInteractionTingAt = 0;
  private pointerNoteIndex = 0;
  private readonly xylophone = new Tone.Sampler({
    urls: { C4: 'C4_ff.wav', G4: 'G4_ff.wav', C5: 'C5_ff.wav', G5: 'G5_ff.wav' },
    baseUrl: 'assets/xylophone-tones/',
    release: .16
  }).toDestination();

  playPop(now = performance.now()): void {
    if (now - this.lastPlayedAt < 70) return;
    this.lastPlayedAt = now;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(420, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(620, this.context.currentTime + 0.07);
      gain.gain.setValueAtTime(0.0001, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, this.context.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.12);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start();
      oscillator.stop(this.context.currentTime + 0.13);
    } catch {
      // Audio may be unavailable or blocked until a browser grants an interaction unlock.
    }
  }

  unlockXylophone(): void {
    void Tone.start();
  }

  playPointerTing(pointerType: string, now = performance.now()): void {
    // Mouse and touch trails can emit dozens of events per second. A gentle,
    // short chime gives both cursor and finger movement a playful rhythm.
    if (!['mouse', 'touch', 'pen'].includes(pointerType) || now - this.lastPointerTingAt < 170) return;
    this.lastPointerTingAt = now;
    try {
      const note = AudioService.POINTER_NOTES[this.pointerNoteIndex++ % AudioService.POINTER_NOTES.length];
      this.xylophone.triggerAttackRelease(note, '64n');
    } catch {
      // Samples may still be loading, or audio may not yet be unlocked by the browser.
    }
  }

  playInteractionTing(now = performance.now()): void {
    if (now - this.lastInteractionTingAt < 70) return;
    this.lastInteractionTingAt = now;
    try {
      // A key press or touch is a valid browser audio gesture and can unlock playback.
      void Tone.start();
      const note = AudioService.POINTER_NOTES[this.pointerNoteIndex++ % AudioService.POINTER_NOTES.length];
      this.xylophone.triggerAttackRelease(note, '64n');
    } catch {
      // Samples may still be loading, or audio may not yet be unlocked by the browser.
    }
  }
}
