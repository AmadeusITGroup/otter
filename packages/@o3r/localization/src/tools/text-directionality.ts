import {
  DIR_DOCUMENT,
  Direction,
  Directionality,
} from '@angular/cdk/bidi';
import {
  inject,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  startWith,
} from 'rxjs/operators';

/**
 * @deprecated The value of Directionality is no longer readonly and can be updated, this class will be removed in v16
 */
@Injectable()
export class TextDirectionality extends Directionality implements OnDestroy {
  public get value(): Direction {
    return this._value;
  }

  public set value(value: Direction) {
    this._value = value;
  }

  /**
   * The current 'ltr' or 'rtl' value.
   * @override
   */
  private _value: Direction = 'ltr';

  constructor() {
    super(inject(DIR_DOCUMENT, { optional: true }));
    this.change
      .pipe(startWith(this._value))
      .subscribe((value: Direction) => this._value = value);
  }

  public ngOnDestroy() {
    this.change.complete();
  }
}
