import { Directive, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';

/**
 * A directive which installs the `MaxValidator` for any `formControlName,
 * `formControl`,
 * or control with `ngModel` that also has a `max` attribute.
 */
@Directive({
  selector: '[max][formControlName],[max][formControl],[max][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MaxValidator),
      multi: true
    }
  ],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  host: {'[attr.max]': 'max ? max : null'}
})
export class MaxValidator implements Validator, OnChanges {
  /** Maximum date to compare to */
  @Input() public max: string | number | null = null;

  private validator: ValidatorFn = (_a) => null;
  private onChange: () => void = () => {};

  private createValidator(): void {
    if (this.max !== null) {
      this.validator = Validators.max(+this.max);
    }
  }

  /** @inheritDoc */
  public ngOnChanges(changes: SimpleChanges): void {
    if ('max' in changes) {
      this.createValidator();

      if (this.onChange) {
        this.onChange();
      }
    }
  }

  /** @inheritDoc */
  public validate(c: AbstractControl): ValidationErrors | null {
    return this.max != null ? this.validator(c) : null;
  }

  /** @inheritDoc */
  public registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }
}
