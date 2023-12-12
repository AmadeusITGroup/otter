import { ChangeDetectionStrategy, Component, forwardRef, Input, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CloseInputDatePickerDirective, DfInputIconDirective } from '@design-factory/design-factory';
import { NgbDate, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'o3r-date-picker-input-pres',
  standalone: true,
  imports: [FormsModule, CloseInputDatePickerDirective, NgbInputDatepicker, DfInputIconDirective],
  templateUrl: './date-picker-input-pres.template.html',
  styleUrls: ['./date-picker-input-pres.style.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerInputPresComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerInputPresComponent implements ControlValueAccessor {
  /** ID of the html element used for selection */
  @Input()
  public id!: string;

  /** Internal selected date by NgBootstrap */
  public selectedDate = signal<NgbDate | null>(null);

  /** Disabled state of the date-picker */
  public isDisabled = signal(false);

  private onChanges!: (val: string) => void;

  private onTouched!: () => void;

  /**
   * Trigger when a date is selected
   * @param date
   */
  public selectDate(date: NgbDate | null) {
    this.selectedDate.set(date);
    this.onChanges(date ? `${date.year}-${date.month}-${date.day}` : '');
    this.onTouched();
  }

  /**
   * Implements ControlValueAccessor
   * @param fn
   */
  public registerOnChange(fn: any): void {
    this.onChanges = fn;
  }

  /**
   * Implements ControlValueAccessor
   * @param fn
   */
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Implements ControlValueAccessor
   * @param isDisabled
   */
  public setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  /**
   * Implements ControlValueAccessor
   * @param obj
   */
  public writeValue(obj: any): void {
    if (typeof obj === 'string' && /\d{4}-\d{2}-\d{2}/.test(obj)) {
      const [year, month, day] = obj.split('-', 3);
      this.selectedDate.set(NgbDate.from({year: +year, month: +month, day: +day}));
    } else {
      this.selectedDate.set(null);
    }
  }
}
