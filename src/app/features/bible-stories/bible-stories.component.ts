import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Story {
  readonly title: string;
  readonly reference: string;
  readonly description: string;
  readonly emoji: string;
  readonly colour: 'sun' | 'sea' | 'garden' | 'sky' | 'night' | 'rain';
}

@Component({
  selector: 'app-bible-stories',
  imports: [RouterLink],
  templateUrl: './bible-stories.component.html',
  styleUrl: './bible-stories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BibleStoriesComponent {
  readonly stories: readonly Story[] = [
    { title: 'Noah and the Rainbow', reference: 'Genesis 6–9', description: 'A big boat, lots of animals and a colourful promise in the sky.', emoji: '🌈', colour: 'rain' },
    { title: 'David and Goliath', reference: '1 Samuel 17', description: 'A brave young shepherd shows that courage can come in small sizes.', emoji: '🪨', colour: 'sun' },
    { title: 'Jonah and the Big Fish', reference: 'Jonah 1–4', description: 'A stormy sea, a surprising rescue and a second chance.', emoji: '🐋', colour: 'sea' },
    { title: 'Daniel and the Lions', reference: 'Daniel 6', description: 'Daniel chooses to trust God, even in a den full of lions.', emoji: '🦁', colour: 'night' },
    { title: 'The Good Samaritan', reference: 'Luke 10:25–37', description: 'A simple story about noticing people and choosing kindness.', emoji: '💛', colour: 'garden' },
    { title: 'Jesus Calms the Storm', reference: 'Mark 4:35–41', description: 'When the wind and waves grow loud, Jesus brings peace.', emoji: '⛵', colour: 'sky' }
  ];
}
