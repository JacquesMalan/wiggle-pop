import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private context?: AudioContext;
  private lastPlayedAt = 0;

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
}
