import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as Tone from 'tone';

interface Note { readonly id: 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4' | 'C5'; readonly name: string; readonly key: string; readonly triggers: readonly string[]; readonly colour: string; readonly icon: string; }
interface Song { readonly id: string; readonly emoji: string; readonly title: string; readonly notes: readonly Note['id'][]; }
const NOTES: readonly Note[] = [
  { id: 'C4', name: 'Do', key: 'Q', triggers: ['Q', 'A', 'Z'], colour: '#ffad84', icon: '🦊' }, { id: 'D4', name: 'Re', key: 'W', triggers: ['W', 'S', 'X'], colour: '#f5d277', icon: '⭐' },
  { id: 'E4', name: 'Mi', key: 'E', triggers: ['E', 'D', 'C'], colour: '#b5d7a8', icon: '🍃' }, { id: 'F4', name: 'Fa', key: 'R', triggers: ['R', 'F', 'V'], colour: '#86cdb9', icon: '🐢' },
  { id: 'G4', name: 'Sol', key: 'T', triggers: ['T', 'G', 'B'], colour: '#90cce0', icon: '🐳' }, { id: 'A4', name: 'La', key: 'Y', triggers: ['Y', 'H', 'N'], colour: '#b9afe0', icon: '🌙' },
  { id: 'B4', name: 'Ti', key: 'U', triggers: ['U', 'J', 'M'], colour: '#cba8cc', icon: '🐦' }, { id: 'C5', name: 'Do', key: 'I', triggers: ['I', 'K', ','], colour: '#e6afbd', icon: '☁️' }
];
const SONGS: readonly Song[] = [
  { id: 'twinkle', emoji: '⭐', title: 'Twinkle Twinkle', notes: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'] },
  { id: 'mary', emoji: '🐑', title: 'Mary Had a Little Lamb', notes: ['E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'D4', 'D4', 'D4', 'E4', 'G4', 'G4'] },
  { id: 'row', emoji: '🚣', title: 'Row Row Row Your Boat', notes: ['C4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'E4', 'F4', 'G4'] },
  { id: 'sleeping', emoji: '😴', title: 'Are You Sleeping?', notes: ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4'] }
];

@Component({ selector: 'app-xylophone', imports: [RouterLink], templateUrl: './xylophone.component.html', styleUrl: './xylophone.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class XylophoneComponent implements OnDestroy {
  private readonly xylophone = new Tone.Sampler({
    urls: { C4: 'C4_ff.wav', G4: 'G4_ff.wav', C5: 'C5_ff.wav', G5: 'G5_ff.wav' },
    baseUrl: 'assets/xylophone-tones/',
    release: .7
  }).toDestination();
  readonly notes = NOTES;
  readonly songs = SONGS;
  readonly activeNote = signal<Note['id'] | undefined>(undefined);
  readonly selectedSong = signal<Song | undefined>(undefined);
  readonly phase = signal<'picking' | 'choosing-mode' | 'listening' | 'playing' | 'complete'>('picking');
  readonly progress = signal(0);
  readonly hintedNote = signal<Note['id'] | undefined>(undefined);
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private hintTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void { this.clearTimers(); if (this.hintTimer) clearTimeout(this.hintTimer); this.xylophone.dispose(); }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const note = NOTES.find((item) => item.triggers.includes(event.key.toUpperCase()));
    if (!note) return;
    event.preventDefault();
    this.play(note);
  }

  selectSong(song: Song): void { this.clearTimers(); this.selectedSong.set(song); this.progress.set(0); this.phase.set('choosing-mode'); }

  showMe(): void {
    const song = this.selectedSong();
    if (!song) return;
    this.clearTimers();
    void Tone.start();
    this.phase.set('listening');
    this.progress.set(0);
    song.notes.forEach((id, index) => this.timer(() => this.playSound(NOTES.find((note) => note.id === id)!), index * 620));
    this.timer(() => { this.activeNote.set(undefined); this.phase.set('choosing-mode'); }, song.notes.length * 620 + 180);
  }

  myTurn(): void { if (!this.selectedSong()) return; this.clearTimers(); this.hintedNote.set(undefined); this.progress.set(0); this.phase.set('playing'); }

  showHint(): void {
    const note = this.selectedSong()?.notes[this.progress()];
    if (!note || this.phase() !== 'playing') return;
    if (this.hintTimer) clearTimeout(this.hintTimer);
    this.hintedNote.set(note);
    this.hintTimer = setTimeout(() => { this.hintedNote.set(undefined); this.hintTimer = undefined; }, 1150);
  }

  play(note: Note): void {
    if (this.phase() === 'listening' || this.phase() === 'complete') return;
    void Tone.start();
    this.playSound(note);
    if (this.phase() !== 'playing') return;
    if (note.id === this.selectedSong()?.notes[this.progress()]) {
      const next = this.progress() + 1;
      this.hintedNote.set(undefined);
      this.progress.set(next);
      if (next === this.selectedSong()!.notes.length) this.timer(() => this.phase.set('complete'), 420);
    }
  }

  pickAnotherSong(): void { this.clearTimers(); if (this.hintTimer) clearTimeout(this.hintTimer); this.hintedNote.set(undefined); this.selectedSong.set(undefined); this.phase.set('picking'); this.progress.set(0); this.activeNote.set(undefined); }

  private playSound(note: Note): void {
    this.xylophone.triggerAttackRelease(note.id, '8n');
    this.activeNote.set(note.id);
    this.timer(() => { if (this.activeNote() === note.id) this.activeNote.set(undefined); }, 330);
  }

  private timer(callback: () => void, delay: number): void { const id = setTimeout(() => { this.timers.delete(id); callback(); }, delay); this.timers.add(id); }
  private clearTimers(): void { this.timers.forEach((timer) => clearTimeout(timer)); this.timers.clear(); }
}
