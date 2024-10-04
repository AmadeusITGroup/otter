import { ChangeDetectionStrategy, Component, forwardRef, inject, Input, Pipe, type PipeTransform, signal, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CloseInputDatePickerDirective, DfDatePickerModule, DfInputIconDirective } from '@design-factory/design-factory';
import { NgbCalendar, NgbCalendarHebrew, NgbDate, NgbDatepickerI18n, NgbDatepickerI18nHebrew, type NgbDateStruct, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { O3rComponent } from '@o3r/core';
import { DatePickerInputHebrewPresContext } from './date-picker-input-hebrew-pres.context';

@Pipe({
  name: 'getDayNumerals',
  standalone: true
})
export class GetDayNumeralsPipe implements PipeTransform {
  public readonly i18n = inject(NgbDatepickerI18n);

  public transform(date: NgbDateStruct) {
    return this.i18n.getDayNumerals(date);
  }
}

@O3rComponent({ componentType: 'ExposedComponent' })
@Component({
  selector: 'o3r-date-picker-input-pres-new-design',
  standalone: true,
  imports: [
    FormsModule,
    GetDayNumeralsPipe,
    CloseInputDatePickerDirective,
    NgbInputDatepicker,
    DfInputIconDirective,
    DfDatePickerModule
  ],
  templateUrl: './date-picker-input-hebrew-pres.template.html',
  styleUrls: ['./date-picker-input-hebrew-pres.style.scss'],
  providers: [
    NgbCalendarHebrew,
    NgbDatepickerI18nHebrew,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerHebrewInputPresComponent),
      multi: true
    },
    { provide: NgbCalendar, useClass: NgbCalendarHebrew },
    { provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nHebrew }

  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerHebrewInputPresComponent implements ControlValueAccessor, DatePickerInputHebrewPresContext {
  private onTouched!: () => void;

  private onChanges!: (val: string) => void;

  /** Disabled state of the date-picker */
  public isDisabled = signal(false);

  /** Internal selected date by NgBootstrap */
  public selectedDate = signal<NgbDate | null>(null);

  /** @inheritDoc */
  @Input()
  public id!: string;

  private readonly calendar = inject(NgbCalendar);

  public dayTemplateData = (date: NgbDate) => {
    return {
      gregorian: (this.calendar as NgbCalendarHebrew).toGregorian(date)
    };
  };

  /**
   * Trigger when a date is selected
   * @param date
   */
  public selectDate(date: NgbDate | null) {
    const gregorianDate = date && (this.calendar as NgbCalendarHebrew).toGregorian(date);
    this.selectedDate.set(date);
    this.onChanges(gregorianDate ? `${gregorianDate.year}-${gregorianDate.month}-${gregorianDate.day}` : '');
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
      this.selectedDate.set((this.calendar as NgbCalendarHebrew).fromGregorian(NgbDate.from({ year: +year, month: +month, day: +day })!));
    }
    else {
      this.selectedDate.set(null);
    }
  }
}
