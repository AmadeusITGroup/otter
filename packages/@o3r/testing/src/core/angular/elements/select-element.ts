import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SelectElementProfile } from '../../elements';
import { O3rElement } from '../element';

export { SelectElementProfile } from '../../elements';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class O3rSelectElement extends O3rElement implements SelectElementProfile {
  constructor(sourceElement: DebugElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByIndex(index: number) {
    const options = this.sourceElement.queryAll(By.css('option'));
    if (options[index]) {
      const option = new O3rElement(options[index]);
      const value = await option.getValue();

      await this.setValue(value);
      this.sourceElement.triggerEventHandler('change', { target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {} });
    } else {
      return Promise.reject(`Option with index ${index} not found in select element.`);
    }
  }

  /** @inheritdoc */
  public async selectByValue(value: string) {
    const option = this.sourceElement.query(By.css(`option[value='${value}']`));
    if (option) {
      await this.setValue(option.nativeElement.value);
      return this.sourceElement.triggerEventHandler('change', { target: this.sourceElement.nativeElement, preventDefault: () => {}, stopPropagation: () => {} });
    } else {
      return Promise.reject(`Option with value '${value}' not found in select element.`);
    }
  }
}
