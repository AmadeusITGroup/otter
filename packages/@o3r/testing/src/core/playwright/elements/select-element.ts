import {
  O3rElement,
  PlaywrightSourceElement,
} from '../element';

/**
 * Implementation dedicated to Playwright.
 */
export class O3rSelectElement extends O3rElement {
  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    super(sourceElement);
  }

  /** @inheritdoc */
  public selectByIndex(index: number, _timeout?: number) {
    return this.sourceElement.element.selectOption({ index });
  }

  /** @inheritdoc */
  public selectByValue(value: string, _timeout?: number) {
    return this.sourceElement.element.selectOption({ value });
  }

  /** @inheritDoc */
  public async getValue() {
    return this.sourceElement.element.locator('option:checked').inputValue();
  }
}
