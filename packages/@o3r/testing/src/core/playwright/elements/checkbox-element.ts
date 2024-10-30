import {
  CheckboxElementProfile
} from '../../elements';
import {
  O3rElement,
  PlaywrightSourceElement
} from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rCheckboxElement extends O3rElement implements CheckboxElementProfile {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  private async getInputElement() {
    try {
      const subInputElement = this.sourceElement.element.locator('input[type="checkbox"]');
      if (await subInputElement.count()) {
        return subInputElement;
      }
      return this.sourceElement.element;
    } catch {
      return this.sourceElement.element;
    }
  }

  private async getLabelElement() {
    try {
      const element = this.sourceElement.element.locator('label');
      if (await element.count()) {
        return element;
      }
    } catch (err) {
      // eslint-disable-next-line no-console -- no other logger available
      console.warn('Failed to retrieve label of O3rCheckboxElement', err);
      return;
    }
  }

  /**
   * Check the checkbox element
   * @param  value If specified, determine the value of the checkbox button
   * If the element contains a label, the label will be used to (un)check the checkbox.
   */
  public async check(value = true) {
    const labelElement = await this.getLabelElement();
    if (labelElement) {
      const currentValue = await this.isChecked();
      if (currentValue === value) {
        // eslint-disable-next-line no-console -- no other logger available
        console.warn(`Checkbox is already ${currentValue ? 'checked' : 'unchecked'}`);
        return Promise.resolve();
      }
      return labelElement.click();
    }
    return (await this.getInputElement()).setChecked(value);
  }

  /** @inheritDoc */
  public uncheck() {
    return this.check(false);
  }

  /** @inheritDoc */
  public async isChecked(): Promise<boolean> {
    const inputElement = await this.getInputElement();
    return inputElement.isChecked();
  }
}
