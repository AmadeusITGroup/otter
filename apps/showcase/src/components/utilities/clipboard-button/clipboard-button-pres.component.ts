import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { O3rComponent } from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-clipboard-button-pres',
  standalone: true,
  templateUrl: './clipboard-button-pres.template.html',
  styleUrls: ['./clipboard-button-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClipboardButtonPresComponent {
  /**
   * Copy the text into the clipboard
   */
  public copy() {
    // TODO snackbar
  }
}
