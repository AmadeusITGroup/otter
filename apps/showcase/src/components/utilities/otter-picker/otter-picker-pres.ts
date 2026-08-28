import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  ViewEncapsulation,
} from '@angular/core';
import type {
  FormValueControl,
} from '@angular/forms/signals';
import {
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import {
  O3rComponent,
} from '@o3r/core';
import {
  OTTER_ICONS,
} from './otter-icons';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-otter-picker-pres',
  imports: [NgbDropdownModule],
  templateUrl: './otter-picker-pres.html',
  styleUrls: ['./otter-picker-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtterPickerPres implements FormValueControl<string> {
  /** ID of the html element used for selection */
  public readonly id = input.required<string>();

  /** The currently selected otter value */
  public value = model<string>('');

  /** Emits when the control is touched */
  public touch = output<void>();

  /** Disabled state of the picker */
  public disabled = input<boolean>(false);

  /** List of available otters */
  public otters = OTTER_ICONS;

  /** Base URL where the images can be fetched */
  public baseUrl = location.href.split('/#', 1)[0];

  /**
   * Select an otter and notify the parent
   * @param otter selected otter icon path
   */
  public selectOtter(otter: string) {
    this.value.set(otter);
    this.touch.emit();
  }
}
