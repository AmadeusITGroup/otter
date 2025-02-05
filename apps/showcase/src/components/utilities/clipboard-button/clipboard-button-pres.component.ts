import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  DfToastModule,
} from '@design-factory/design-factory';
import {
  O3rComponent,
} from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-clipboard-button-pres',
  imports: [
    DfToastModule
  ],
  templateUrl: './clipboard-button-pres.template.html',
  styleUrls: ['./clipboard-button-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipboardButtonPresComponent {
  public readonly shouldDisplayToast = signal(false);
}
