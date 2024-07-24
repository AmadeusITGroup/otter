import { DIR_DOCUMENT, Direction, Directionality } from '@angular/cdk/bidi';

import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { startWith } from 'rxjs/operators';

@Injectable()
export class TextDirectionality extends Directionality implements OnDestroy {
  /**
   * The current 'ltr' or 'rtl' value.
   * @override
   */
  public value!: Direction;

  constructor(@Optional() @Inject(DIR_DOCUMENT) _document?: any) {
    super(_document);
    this.change
      .pipe(startWith(this.value))
      .subscribe((value: Direction) => this.value = value);
  }

  public ngOnDestroy() {
    this.change.complete();
  }
}
