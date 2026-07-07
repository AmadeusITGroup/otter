import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  O3rComponent,
} from '@o3r/core';
import {
  O3rDynamicContentPipe,
} from '@o3r/dynamic-content';
import {
  MarkdownModule,
} from 'ngx-markdown';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-home',
  imports: [O3rDynamicContentPipe, MarkdownModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home {}
