import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

type AgeFilter = 'all' | '2-3' | '4-5' | '6+';

interface GameEntry {
  readonly title: string;
  readonly description: string;
  readonly category: 'Memory' | 'Pop & Play' | 'Free Play';
  readonly ages: readonly Exclude<AgeFilter, 'all'>[];
  readonly emoji: string;
  readonly route: string;
}

@Component({
  selector: 'app-wiggle-pop-games',
  imports: [RouterLink],
  templateUrl: './wiggle-pop-games.component.html',
  styleUrl: './wiggle-pop-games.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WigglePopGamesComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly subscription = new Subscription();
  readonly ageFilters: ReadonlyArray<{ readonly id: AgeFilter; readonly label: string }> = [
    { id: 'all', label: 'All ages' }, { id: '2-3', label: '2–3' }, { id: '4-5', label: '4–5' }, { id: '6+', label: '6+' }
  ];
  readonly selectedAge = signal<AgeFilter>('all');
  readonly games: readonly GameEntry[] = [{
    title: 'Smash!', description: 'Tap, wiggle and press keys to make the whole world pop.', category: 'Free Play',
    ages: ['2-3', '4-5', '6+'], emoji: '✨', route: '/'
  }, {
    title: 'Tile Memory', description: 'Turn over friendly animals and find their matching friend.', category: 'Memory',
    ages: ['2-3', '4-5', '6+'], emoji: '🐶', route: '/games/tile-memory'
  }, {
    title: 'Find It!', description: 'Find the matching animal in a playful picture hunt.', category: 'Memory',
    ages: ['4-5', '6+'], emoji: '🔎', route: '/games/find-it'
  }, {
    title: 'Balloon Pop', description: 'Pop colourful balloons before they float away.', category: 'Pop & Play',
    ages: ['4-5', '6+'], emoji: '🎈', route: '/games/balloon-pop'
  }, {
    title: 'Pattern Pop', description: 'Spot what comes next in colourful little patterns.', category: 'Pop & Play',
    ages: ['4-5', '6+'], emoji: '🧩', route: '/games/pattern-pop'
  }, {
    title: 'Feed the Monster', description: 'Drag the right snack to a goofy hungry monster.', category: 'Pop & Play',
    ages: ['4-5', '6+'], emoji: '👾', route: '/games/feed-the-monster'
  }, {
    title: 'Twinkle Xylophone', description: 'Listen, then follow the glowing notes to make a tiny tune.', category: 'Pop & Play',
    ages: ['4-5', '6+'], emoji: '🎵', route: '/games/xylophone'
  }, {
    title: 'Colour Splash', description: 'Tap, press and make your very own colourful picture.', category: 'Free Play',
    ages: ['2-3'], emoji: '🎨', route: '/games/colour-splash'
  }];
  readonly visibleGames = computed(() => this.games.filter((game) => this.selectedAge() === 'all' || game.ages.includes(this.selectedAge() as Exclude<AgeFilter, 'all'>)));
  readonly memoryGames = computed(() => this.visibleGames().filter((game) => game.category === 'Memory'));
  readonly popGames = computed(() => this.visibleGames().filter((game) => game.category === 'Pop & Play'));
  readonly freePlayGames = computed(() => this.visibleGames().filter((game) => game.category === 'Free Play'));

  constructor() {
    this.subscription.add(this.route.queryParamMap.subscribe((params) => {
      const age = params.get('age');
      if (age === '2-3' || age === '4-5' || age === '6+') this.selectedAge.set(age);
    }));
  }

  ngOnDestroy(): void { this.subscription.unsubscribe(); }

  selectAge(age: AgeFilter): void { this.selectedAge.set(age); }
}
