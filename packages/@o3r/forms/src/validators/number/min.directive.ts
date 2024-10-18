import { Directive, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

/**
 * A directive which installs the `MinValidator` for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `min` attribute.
 */
@Directive({
  selector: '[min][formControlName],[min][formControl],[min][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MinValidator),
      multi: true
    }
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  host: {'[attr.min]': 'min ? min : null'}
})
export class MinValidator implements Validator, OnChanges {
  /** Minimum date to compare to */
  @Input() public min: string | number | null = null;

  private validator: ValidatorFn = (_a) => null;
  private onChange: () => void = () => {};

  private createValidator(): void {
    if (this.min !== null) {
      this.validator = Validators.min(+this.min);
    }
  }

  /** @inheritDoc */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('min' in changes) {
      this.createValidator();

      if (this.onChange) {
        this.onChange();
      }
    }
  }

  /** @inheritDoc */
  public validate(c: AbstractControl): ValidationErrors | null {
    return this.min == null ? null : this.validator(c);
  }

  /** @inheritDoc */
  public registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}
