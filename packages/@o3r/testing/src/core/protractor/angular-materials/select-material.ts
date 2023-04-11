import {By, element, ElementFinder} from 'protractor';
import {MatSelectProfile} from '../../angular-materials';
import {O3rElement} from '../element';
export {SelectElementProfile} from '../../elements';

/**
 * Implementation dedicated to Protractor.
 */
export class MatSelect extends O3rElement implements MatSelectProfile {
  constructor(sourceElement: ElementFinder | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByIndex(index: number, _timeout?: number) {
    await this.click();
    // eslint-disable-next-line no-underscore-dangle
    const options: ElementFinder[] = await element.all(By.css('mat-option')).asElementFinders_();
    if (typeof options[index] !== 'undefined') {
      const option = new O3rElement(options[index]);
      return option.click();
    } else {
      return Promise.reject(`Option with index ${index} not found in select element.`);
    }
  }

  /** @inheritdoc */
  public async selectByValue(value: string, _timeout?: number) {
    await this.click();
    // eslint-disable-next-line no-underscore-dangle
    const options: ElementFinder[] = await element.all(By.css('mat-option')).asElementFinders_();

    for (const opt of options) {
      const option = new O3rElement(opt);
      if (await option.getAttribute('ng-reflect-value') === value) {
        return option.click();
      }
    }

    return Promise.reject(`Option with value ${value} not found in select element.`);
  }

  /** @inheritdoc */
  public async selectByLabel(label: string, _timeout?: number) {
    await this.click();
    // eslint-disable-next-line no-underscore-dangle
    const options: ElementFinder[] = await element.all(By.css('mat-option')).asElementFinders_();

    for (const opt of options) {
      const option = new O3rElement(opt);
      if (await option.getText() === label) {
        return option.click();
      }
    }

    return Promise.reject(`Option with label ${label} not found in select element.`);
  }

  /** @inheritDoc */
  public getValue() {
    console.warn('Usage of "getValue" is not recommended on Material Select elements. Use "getPlainText()" instead.');
    return super.getValue();
  }
}
