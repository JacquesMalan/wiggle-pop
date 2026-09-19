export interface Animal {
  readonly id: string;
  readonly emoji: string;
  readonly name: string;
}

export const ANIMALS: readonly Animal[] = [
  { id: 'puppy', emoji: '🐶', name: 'puppy' },
  { id: 'kitten', emoji: '🐱', name: 'kitten' },
  { id: 'frog', emoji: '🐸', name: 'frog' },
  { id: 'lion', emoji: '🦁', name: 'lion' },
  { id: 'panda', emoji: '🐼', name: 'panda' },
  { id: 'monkey', emoji: '🐵', name: 'monkey' },
  { id: 'fox', emoji: '🦊', name: 'fox' },
  { id: 'koala', emoji: '🐨', name: 'koala' }
];
