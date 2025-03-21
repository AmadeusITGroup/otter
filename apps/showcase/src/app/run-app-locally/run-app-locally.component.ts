import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  O3rComponent,
} from '@o3r/core';
import {
  MarkdownModule,
} from 'ngx-markdown';

@O3rComponent({ componentType: 'Page' })
@Component({
  selector: 'o3r-run-app-locally',
  imports: [MarkdownModule],
  templateUrl: './run-app-locally.template.html',
  styleUrls: ['./run-app-locally.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunAppLocallyComponent {
  public runAppCommands = `git clone https://github.com/AmadeusITGroup/otter
cd otter
yarn install
yarn ng serve showcase`;
}
