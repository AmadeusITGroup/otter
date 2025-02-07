import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  O3rComponent,
} from '@o3r/core';
import {
  DynamicContentModule,
} from '@o3r/dynamic-content';
import {
  MarkdownModule,
} from 'ngx-markdown';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-home',
  imports: [DynamicContentModule, MarkdownModule],
  templateUrl: './home.template.html',
  styleUrls: ['./home.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}
