import {
  By,
  element,
  ElementFinder,
} from 'protractor';
import {
  MatAutocompleteProfile,
} from '../../angular-materials';
import {
  O3rElement,
} from '../element';

export { SelectElementProfile } from '../../elements';

/**
 * Implementation dedicated to Protractor.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class MatAutocomplete extends O3rElement implements MatAutocompleteProfile {
  constructor(sourceElement: ElementFinder | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByValue(value: string, _timeout?: number) {
    await this.setValue(value);
    await this.click();
    const matOption = element(By.css('.mat-option, mat-option'));
    return new O3rElement(matOption).click();
  }
}
