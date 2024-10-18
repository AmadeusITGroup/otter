import {browser, ElementFinder} from 'protractor';
import {protractor as ptor} from 'protractor/built/ptor';
import {waitForOtterStable} from '../../tools/protractor';
import {ElementProfile} from '../element';
import {convertPromise} from './utils';

export {ElementProfile} from '../element';

/**
 * Implementation dedicated to protractor.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rElement implements ElementProfile {
  /** Protractor ElementProfile */
  public sourceElement: ElementFinder;

  constructor(sourceElement: ElementFinder | O3rElement) {
    this.sourceElement = sourceElement instanceof O3rElement ? sourceElement.sourceElement : sourceElement;
  }

  /** @inheritdoc */
  public getText() {
    return convertPromise(this.sourceElement.getText());
  }

  /** @inheritdoc */
  public async getPlainText() {
    const innerText = await this.getText();
    return Promise.resolve(innerText ? innerText.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/\s\s+/g, ' ').trim() : undefined);
  }

  /** @inheritdoc */
  public getInnerHTML(): Promise<string | undefined> {
    return convertPromise(this.sourceElement.getInnerHtml());
  }

  /** @inheritdoc */
  public mouseOver() {
    return convertPromise(
      browser
        .actions()
        .mouseMove(this.sourceElement)
        .perform()
    );
  }

  /** @inheritdoc */
  public async getValue() {
    const value = await this.sourceElement.getAttribute('value');
    return value === null ? undefined : value;
  }

  /** @inheritdoc */
  public async setValue(input: string) {
    // Clears the value in the field
    await this.clearValue();
    await this.sourceElement.sendKeys(input);
    await this.sourceElement.sendKeys(ptor.Key.TAB);
    return waitForOtterStable();
  }

  /** @inheritdoc */
  public async clearValue() {
    const currentValue = await this.getValue();

    if (currentValue !== undefined) {
      await this.sourceElement.sendKeys(...Array.from({length: currentValue.length + 1}).fill(ptor.Key.BACK_SPACE));
    }
  }

  /** @inheritdoc */
  public async click() {
    await this.sourceElement.click();
    return waitForOtterStable();
  }

  /** @inheritdoc */
  public async isVisible() {
    return await this.sourceElement.isDisplayed();
  }

  /** @inheritdoc */
  public async getAttribute(attributeName: string) {
    const attribute = await this.sourceElement.getAttribute(attributeName);
    return attribute === null ? undefined : attribute;
  }
}

/**
 * Constructor of a O3rElement
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export type O3rElementConstructor<T extends ElementProfile> = new (sourceElement: ElementFinder | O3rElement) => T;
