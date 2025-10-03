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
  templateUrl: './clipboard-button-pres.html',
  styleUrls: ['./clipboard-button-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipboardButtonPres {
  public readonly shouldDisplayToast = signal(false);
}
