import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-for-parents',
  imports: [RouterLink],
  templateUrl: './for-parents.component.html',
  styleUrl: './for-parents.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForParentsComponent {}
