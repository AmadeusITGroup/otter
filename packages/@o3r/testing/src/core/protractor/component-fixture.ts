/* eslint-disable new-cap */
import { browser, By, element, ElementFinder } from 'protractor';
import { FixtureUsageError } from '../../errors/index';

import { ComponentFixtureProfile } from '../component-fixture';
import { O3rElement, O3rElementConstructor } from './element';
import { O3rGroup, O3rGroupConstructor } from './group';
import { convertPromise } from './utils';

export { ComponentFixtureProfile, Constructable, FixtureWithCustom } from '../component-fixture';

/**
 * Implementation of the fixture dedicated to protractor, hence using the webdriver to interact with the dom.
 */
export class O3rComponentFixture<V extends O3rElement = O3rElement> implements ComponentFixtureProfile<V> {
  /**
   * DOM element linked to the fixture.
   */
  protected rootElement?: V;

  /**
   * Root element of this fixture. Optional in a Protractor.
   * All further queries will be applied to the element tree if any, otherwise they will be applied to the whole DOM.
   *
   * @param rootElement
   */
  constructor(rootElement?: V) {
    this.rootElement = rootElement;
  }

  protected throwOnUndefined<T extends O3rElement>(elemnt?: T) {
    if (!elemnt) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    return elemnt;
  }

  /** @inheritdoc */
  public async query(selector: string, returnType?: undefined): Promise<O3rElement | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    const sourceElement = this.rootElement && this.rootElement.sourceElement;
    const cssSelector = By.css(selector);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const isElPresent = await (sourceElement! || browser).isElementPresent(cssSelector);
    if (!isElPresent) {
      console.warn(`No component matching ${selector} found`);
      return;
    }
    const queriedElement = sourceElement ? sourceElement.element(cssSelector) : element(cssSelector);
    return returnType ? new returnType(queriedElement) : new O3rElement(queriedElement);
  }

  /** @inheritdoc */
  public async queryNth(selector: string, index: number, returnType?: undefined): Promise<O3rElement | undefined>;
  public async queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public async queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    const sourceElement = this.rootElement && this.rootElement.sourceElement;
    const item = (sourceElement || element).all(By.css(selector)).get(index);
    if (!(await item.isPresent())) {
      console.warn(`No component matching ${selector}:nth(${index}) found`);
      return;
    }
    return new (returnType || O3rElement)(item);
  }

  /** @inheritdoc */
  public async queryAll(_selector: string, _returnType?: undefined, groupType?: undefined): Promise<O3rElement[]>;
  public async queryAll<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>, groupType?: undefined): Promise<T[]>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(selector: string, returnType: O3rElementConstructor<T>, groupType: O3rGroupConstructor<K, T>): Promise<K>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(
    selector: string,
    returnType: O3rElementConstructor<T> | undefined,
    groupType: O3rGroupConstructor<K, T> | undefined
  ): Promise<(T | O3rElement)[] | K> {
    const pElements = (this.rootElement ? this.rootElement.sourceElement.all(By.css(selector)) : element.all(By.css(selector)))
      .filter((item) => typeof item !== 'undefined')
      .then((elf: ElementFinder[]) => elf.map((item) => (returnType ? new returnType(item) : new O3rElement(item))));
    const elements = await convertPromise(pElements);

    if (groupType) {
      const group = new groupType(elements as T[]);
      const isValid = await group.isValidGroup();

      if (!isValid) {
        throw new FixtureUsageError('invalid group of items');
      }
      return Promise.resolve(group);
    }

    return elements;
  }

  /** @inheritdoc */
  public getElement() {
    return this.rootElement;
  }

  /** @inheritdoc */
  public getSubComponents(): Promise<{[componentName: string]: ComponentFixtureProfile[]}> {
    return Promise.resolve({block: [this]});
  }

  /** @inheritDoc */
  public async queryNotPresent(selector: string, _timeout?: number): Promise<boolean> {
    const sourceElement = this.rootElement && this.rootElement.sourceElement;
    return !(await (sourceElement || browser).isElementPresent(By.css(selector)));
  }
}
