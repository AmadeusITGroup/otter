import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { formatDate } from '@angular/common';
import { O3rComponent } from '@o3r/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerInputPresComponent } from '../../utilities';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-basic-pres',
  standalone: true,
  imports: [ReactiveFormsModule, DatePickerInputPresComponent],
  templateUrl: './basic-pres.template.html',
  styleUrls: ['./basic-pres.style.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicPresComponent {
  /**
   * Form group
   */
  public form: FormGroup<{ destination: FormControl<string | null>; outboundDate: FormControl<string | null> }>;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      destination: new FormControl<string | null>(null),
      outboundDate: new FormControl<string | null>(this.formatDate(Date.now() + 7 * ONE_DAY_IN_MS))
    });
  }

  private formatDate(dateTime: number) {
    return formatDate(dateTime, 'yyyy-MM-dd', 'en-GB');
  }
}
