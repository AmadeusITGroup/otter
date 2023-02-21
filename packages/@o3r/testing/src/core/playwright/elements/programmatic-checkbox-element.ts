import { O3rCheckboxElement } from './checkbox-element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rProgrammaticCheckboxElement extends O3rCheckboxElement {
  /**
   * @inheritDoc
   */
  public async check(value = true) {
    const labelElement = await this.getLabelElement();
    if (labelElement) {
      const currentValue = await this.isChecked();
      if (currentValue === value) {
        return Promise.resolve();
      }
      return labelElement.dispatchEvent('click');
    }
    return (await this.getInputElement()).setChecked(value);
  }
}
