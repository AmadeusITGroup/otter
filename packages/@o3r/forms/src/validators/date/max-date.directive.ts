import {utils} from '@ama-sdk/core';
import {Directive, forwardRef, Input, OnChanges, SimpleChanges} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

/**
 * A directive which installs the `MaxDateValidator` for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `maxdate` attribute.
 */
@Directive({
  selector: '[maxdate][formControlName],[maxdate][formControl],[maxdate][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MaxDateValidator),
      multi: true
    }
  ]
})
export class MaxDateValidator implements Validator, OnChanges {
  /** Maximum date to compare to */
  @Input() public maxdate: utils.Date | null = null;

  private validator: ValidatorFn = (_a) => null;
  private onChange: () => void = () => {};

  private createValidator(): void {
    this.validator = MaxDateValidator.maxDate(this.maxdate);
  }

  /** @inheritDoc */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('maxdate' in changes) {
      this.createValidator();

      if (this.onChange) {
        this.onChange();
      }
    }
  }

  /** @inheritDoc */
  public validate(c: AbstractControl): ValidationErrors | null {
    return this.maxdate != null ? this.validator(c) : null;
  }

  /** @inheritDoc */
  public registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  /**
   * Maximum Date validator
   * @param maxDate Maximum date to compare to
   */
  public static maxDate(maxDate: utils.Date | null): ValidatorFn {
    const result = (control: AbstractControl): ValidationErrors | null => {
      if (control.value instanceof utils.Date) {
        return maxDate && control.value.getTime() > maxDate.getTime() ? {maxdate: {requiredDate: maxDate, actualDate: control.value}} : null;
      }

      return null;
    };

    return result;
  }
}
