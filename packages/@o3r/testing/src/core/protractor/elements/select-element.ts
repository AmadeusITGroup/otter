import {
  By,
  ElementFinder,
} from 'protractor';
import {
  SelectElementProfile,
} from '../../elements';
import {
  O3rElement,
} from '../element';

/**
 * Implementation dedicated to Protractor.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rSelectElement extends O3rElement implements SelectElementProfile {
  constructor(sourceElement: ElementFinder | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByIndex(index: number, _timeout?: number) {
    await this.click();
    const options = this.sourceElement.all(By.tagName('option'));
    return new O3rElement(options.get(index)).click();
  }

  /** @inheritdoc */
  public async selectByValue(value: string, _timeout?: number) {
    await this.click();
    const option = this.sourceElement.element(By.css(`option[value='${value}']`));
    return new O3rElement(option).click();
  }
}
