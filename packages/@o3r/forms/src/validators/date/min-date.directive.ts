import {utils} from '@ama-sdk/core';
import {Directive, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

/**
 * A directive which installs the `MinDateValidator` for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `mindate` attribute.
 */
@Directive({
  selector: '[mindate][formControlName],[mindate][formControl],[mindate][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinDateValidator),
      multi: true
    }
  ]
})
export class MinDateValidator implements Validator, OnChanges {
  /** Minimum date to compare to */
  @Input() public mindate: utils.Date | null = null;

  private validator: ValidatorFn = (_a) => null;
  private onChange: () => void = () => {};

  private createValidator(): void {
    this.validator = MinDateValidator.minDate(this.mindate);
  }

  /** @inheritDoc */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('mindate' in changes) {
      this.createValidator();

      if (this.onChange) {
        this.onChange();
      }
    }
  }

  /** @inheritDoc */
  public validate(c: AbstractControl): ValidationErrors | null {
    return this.mindate != null ? this.validator(c) : null;
  }

  /** @inheritDoc */
  public registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  /**
   * Minimum Date validator
   * @param minDate Minimum date to compare to
   */
  public static minDate(minDate: utils.Date | null): ValidatorFn {
    const result = (control: AbstractControl): ValidationErrors | null => {
      if (control.value instanceof utils.Date) {
        return minDate && control.value.getTime() < minDate.getTime() ? {mindate: {requiredDate: minDate, actualDate: control.value}} : null;
      }

      return null;
    };

    return result;
  }
}
