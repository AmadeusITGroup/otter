import {
  MatAutocompleteProfile,
} from '../../angular-materials';
import {
  getPlainText,
  O3rElement,
  PlaywrightSourceElement,
} from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class MatAutocomplete extends O3rElement implements MatAutocompleteProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public async selectByValue(value: string, timeout = 5000) {
    await this.setValue(value);
    await this.click();
    const element = this.sourceElement.page;
    const matOptions = element.locator('.mat-option, mat-option');
    await matOptions.first().waitFor({ state: 'attached', timeout });
    const matOptionsCount = await matOptions.count();
    const options: (string | undefined)[] = [];
    if (matOptionsCount > 1) {
      for (let i = 0; i < matOptionsCount; i++) {
        options.push(getPlainText(await matOptions.nth(i).innerText()));
      }
      throw new Error(`MatAutocomplete selectByValue works only for filtered autocomplete. Found multiple values: ${options.join(', ')}`);
    }
    if (matOptionsCount === 1) {
      const selectedOption: PlaywrightSourceElement = { element: matOptions.nth(0), page: this.sourceElement.page };
      await new O3rElement(selectedOption).click();
      return this.sourceElement.element.press('Tab');
    }

    return Promise.reject(new Error('Element with selector .mat-option, mat-option not found.'));
  }
}
