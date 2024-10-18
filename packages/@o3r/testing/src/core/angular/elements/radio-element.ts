import {
  DebugElement
} from '@angular/core';
import {
  RadioElementProfile
} from '../../elements';
import {
  O3rElement
} from '../element';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class O3rRadioElement extends O3rElement implements RadioElementProfile {
  constructor(sourceElement: DebugElement) {
    super(sourceElement);
  }

  /** @inheritDoc */
  public check(value = true) {
    if (this.sourceElement.nativeElement) {
      this.sourceElement.nativeElement.checked = value;
    }

    this.sourceElement.triggerEventHandler('change', { target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {} });
    return Promise.resolve();
  }

  /** @inheritDoc */
  public uncheck(): Promise<void> {
    return this.check(false);
  }

  /** @inheritDoc */
  public isChecked(): Promise<boolean> {
    return Promise.resolve(this.sourceElement.nativeElement && this.sourceElement.nativeElement.checked);
  }
}
