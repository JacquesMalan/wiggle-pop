export type ParticleKind = 'circle' | 'star' | 'sparkle' | 'bubble';

export interface PlayTheme {
  id: 'rainbow';
  colours: readonly string[];
  particles: readonly ParticleKind[];
}

export const RAINBOW_THEME: PlayTheme = {
  id: 'rainbow',
  colours: ['#ff5f8f', '#ffad4c', '#ffe66d', '#55d6be', '#5a9cff', '#a87cff'],
  particles: ['circle', 'star', 'sparkle', 'bubble']
};
