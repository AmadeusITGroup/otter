import type {
  Locator,
  Page
} from '@playwright/test';
import {
  ElementProfile
} from '../element';

export { ElementProfile } from '../element';

/**
 * Playwright type for source element
 * @param element is the DOM element
 * @param page is the tab in the browser where the test is run
 */

export type PlaywrightSourceElement = {
  element: Locator;
  page: Page;
};

/**
 * Remove text formatting (endline etc.) and return the content.
 * @param innerText
 */
export function getPlainText(innerText: string) {
  return innerText ? innerText.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/\s\s+/g, ' ').trim() : undefined;
}

/**
 * Implementation dedicated to Playwright.
 */
export class O3rElement implements ElementProfile {
  /** Playwright sourceElement */
  public sourceElement: PlaywrightSourceElement;

  constructor(sourceElement: PlaywrightSourceElement | O3rElement) {
    this.sourceElement = sourceElement instanceof O3rElement
      ? { element: sourceElement.sourceElement.element, page: sourceElement.sourceElement.page }
      : sourceElement;
  }

  /** @inheritdoc */
  public getText() {
    return this.sourceElement.element.innerText();
  }

  /** @inheritdoc */
  public async getPlainText() {
    return getPlainText(await this.getText());
  }

  /** @inheritdoc */
  public getInnerHTML(): Promise<string | undefined> {
    return this.sourceElement.element.innerHTML();
  }

  /** @inheritdoc */
  public mouseOver() {
    return this.sourceElement.element.hover();
  }

  /** @inheritdoc */
  public async getValue() {
    try {
      return await this.sourceElement.element.inputValue();
    } catch {
      console.warn('Failed to retrieve input value');
      const valueByAttribute = await this.sourceElement.element.getAttribute('value');
      return valueByAttribute === null ? undefined : valueByAttribute;
    }
  }

  /** @inheritdoc */
  public async setValue(input: string) {
    await this.sourceElement.element.fill(input);

    await this.sourceElement.element.press('Tab');
  }

  /** @inheritdoc */
  public async clearValue() {
    await this.sourceElement.element.fill('');
  }

  /** @inheritdoc */
  public click() {
    return this.sourceElement.element.click();
  }

  /** @inheritdoc */
  public isVisible() {
    return this.sourceElement.element.isVisible();
  }

  /** @inheritdoc */
  public async getAttribute(attributeName: string) {
    const attribute = await this.sourceElement.element.getAttribute(attributeName);
    return attribute === null ? undefined : attribute;
  }
}

/**
 * Constructor of a O3rElement
 */
export type O3rElementConstructor<T extends ElementProfile> = new (sourceElement: PlaywrightSourceElement | O3rElement) => T;
