import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import {
  O3rComponent,
} from '@o3r/core';
import {
  DatePickerInputPresContext,
} from './date-picker-input-pres-context';

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-date-picker-input-pres',
  imports: [FormsModule, NgbInputDatepicker, ReactiveFormsModule],
  templateUrl: './date-picker-input-pres.html',
  styleUrls: ['./date-picker-input-pres.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerInputPres),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerInputPres implements ControlValueAccessor, DatePickerInputPresContext {
  /** Disabled state of the date-picker */
  public isDisabled = signal(false);

  /** Internal selected date by NgBootstrap */
  public dateControl = new FormControl<NgbDateStruct | undefined>(undefined, { nonNullable: true });
  /** @inheritDoc */
  public id = input.required<string>();

  /** @inheritDoc */
  public label = input<string | undefined>();

  constructor() {
    this.dateControl.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((date) => {
      this.onChanges(date ? `${date.year}-${date.month}-${date.day}` : '');
      this.onTouched();
    });
  }

  private onTouched: () => void = () => {};

  private onChanges: (val: string) => void = (_val: string) => {};

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
      this.dateControl.setValue({ year: +year, month: +month, day: +day });
    } else {
      this.dateControl.setValue(undefined);
    }
  }
}
