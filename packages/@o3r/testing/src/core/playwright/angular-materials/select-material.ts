import {MatSelectProfile} from '../../angular-materials';
import {O3rElement, PlaywrightSourceElement} from '../element';
export {SelectElementProfile} from '../../elements';

/**
 * Implementation dedicated to Playwright.
 */
export class MatSelect extends O3rElement implements MatSelectProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByIndex(index: number, timeout = 5000) {
    await this.click();
    const options = this.sourceElement.page.locator('mat-option');
    await options.first().waitFor({state: 'attached', timeout});
    if ((await options.count()) >= index + 1) {
      const selectedOption: PlaywrightSourceElement = {element: options.nth(index), page: this.sourceElement.page};
      const option = new O3rElement(selectedOption);
      return option.click();
    } else {
      return Promise.reject(`Option with index ${index} not found in select element.`);
    }
  }

  /** @inheritdoc */
  public async selectByValue(value: string, timeout = 5000) {
    await this.click();
    const options = this.sourceElement.page.locator('mat-option');
    await options.first().waitFor({state: 'attached', timeout});
    const optionsCount = await options.count();
    for (let i = 0; i < optionsCount; i++) {
      const selectedOption: PlaywrightSourceElement = {element: options.nth(i), page: this.sourceElement.page};
      const option = new O3rElement(selectedOption);
      if (await option.getAttribute('ng-reflect-value') === value) {
        return option.click();
      }
    }
    return Promise.reject(`Option with value ${value} not found in select element.`);
  }

  /** @inheritdoc */
  public async selectByLabel(label: string, timeout = 5000) {
    await this.click();
    const options = this.sourceElement.page.locator('mat-option');
    await options.first().waitFor({state: 'attached', timeout});
    const optionsCount = await options.count();
    for (let i = 0; i < optionsCount; i++) {
      const selectedOption: PlaywrightSourceElement = {element: options.nth(i), page: this.sourceElement.page};
      const option = new O3rElement(selectedOption);
      if (await option.getText() === label) {
        return option.click();
      }
    }

    return Promise.reject(`Option with label ${label} not found in select element.`);
  }

  /** @inheritDoc */
  public getValue(): Promise<string | undefined> {
    throw new Error('Cannot use "getValue" function on a Material Select element. Use "getPlainText()" instead.');
  }
}
