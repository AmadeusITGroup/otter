import {
  DebugElement
} from '@angular/core';
import {
  MatAutocompleteProfile
} from '../../angular-materials';
import {
  O3rElement
} from '../element';

export { SelectElementProfile } from '../../elements';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class MatAutocomplete extends O3rElement implements MatAutocompleteProfile {
  constructor(sourceElement: DebugElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByValue(value: string, _timeout?: number) {
    await this.setValue(value);
    return this.sourceElement.triggerEventHandler('change', { target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {} });
  }
}
