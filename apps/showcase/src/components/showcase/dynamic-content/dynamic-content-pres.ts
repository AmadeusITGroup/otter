import {
  formatDate,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  form,
  FormField,
} from '@angular/forms/signals';
import {
  O3rComponent,
} from '@o3r/core';
import {
  O3rDynamicContentPipe,
} from '@o3r/dynamic-content';
import {
  DatePickerInputPres,
} from '../../utilities';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-dynamic-content-pres',
  imports: [FormField, O3rDynamicContentPipe, DatePickerInputPres],
  templateUrl: './dynamic-content-pres.html',
  styleUrls: ['./dynamic-content-pres.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicContentPres {
  /**
   * Form model
   */
  public model = signal({
    destination: '',
    outboundDate: this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS)
  });

  /**
   * Form tree
   */
  public formTree = form(this.model);

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
