import {
  DebugElement,
} from '@angular/core';
import {
  By,
} from '@angular/platform-browser';
import {
  MatSelectProfile,
} from '../../angular-materials';
import {
  O3rElement,
} from '../element';

/**
 * Implementation dedicated to angular / TestBed.
 */
export class MatSelect extends O3rElement implements MatSelectProfile {
  constructor(sourceElement: DebugElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByIndex(index: number, _timeout?: number) {
    await this.click();
    const options = this.sourceElement.queryAll(By.css('mat-option'));
    if (options[index]) {
      const option = new O3rElement(options[index]);
      return option.click();
    } else {
      return Promise.reject(new Error(`Option with index ${index} not found in select element.`));
    }
  }

  /** @inheritdoc */
  public async selectByValue(value: string, _timeout?: number) {
    await this.click();
    const options = this.sourceElement.queryAll(By.css('mat-option'));

    for (const opt of options) {
      const option = new O3rElement(opt);
      if (await option.getAttribute('ng-reflect-value') === value) {
        return option.click();
      }
    }

    return Promise.reject(new Error(`Option with value ${value} not found in select element.`));
  }

  /** @inheritdoc */
  public async selectByLabel(label: string, _timeout?: number) {
    await this.click();
    const options = this.sourceElement.queryAll(By.css('mat-option'));

    for (const opt of options) {
      const option = new O3rElement(opt);
      if (await option.getText() === label) {
        return option.click();
      }
    }

    return Promise.reject(new Error(`Option with label ${label} not found in select element.`));
  }

  /** @inheritDoc */
  public getValue() {
    // eslint-disable-next-line no-console -- no other logger available
    console.warn('Usage of "getValue" is not recommended on Material Select elements. Use "getPlainText()" instead.');
    return super.getValue();
  }
}
