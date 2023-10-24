/* eslint-disable new-cap */
import { FixtureUsageError } from '../../errors/index';
import type { ComponentFixtureProfile } from '../component-fixture';
import { withTimeout } from '../helpers';
import { O3rElement, O3rElementConstructor, PlaywrightSourceElement } from './element';
import { O3rGroup, O3rGroupConstructor } from './group';

export type { ComponentFixtureProfile, Constructable, FixtureWithCustom } from '../component-fixture';

/**
 * Implementation of the fixture dedicated to Playwright, hence using the webdriver to interact with the dom.
 */
export class O3rComponentFixture<V extends O3rElement = O3rElement> implements ComponentFixtureProfile<V> {

  /**
   * DOM element linked to the fixture.
   */
  protected rootElement: V;

  /**
   * Root element of this fixture.
   * All further queries will be applied to the element tree if any, otherwise they will be applied to the whole DOM.
   *
   * @param rootElement
   */
  constructor(rootElement: V) {
    this.rootElement = rootElement;
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @param timeout specific timeout that will throw when reach
   */
  protected async throwOnUndefinedElement<T extends O3rElement>(element?: T, timeout?: number): Promise<T> {
    if (!element) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    const count = await withTimeout(element.sourceElement.element.count(), timeout);
    if (!count) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    return element;
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @param timeout specific timeout that will throw when reach
   */
  protected async throwOnUndefined<T extends O3rElement>(element: Promise<T | undefined>, timeout?: number): Promise<T> {
    return withTimeout(element, timeout)
      .then((el) => el?.sourceElement.element.count())
      .then((count) => (count || 0) > 0)
      .then((isPresent) => {
        if (!isPresent) {
          throw new Error('Element not found in ' + this.constructor.name);
        }
      })
      .then(() => element as Promise<T>);
  }

  /**
   * Get the element associated to the selector if present
   *
   * @param selector Selector to access the element
   * @param elementConstructor Constructor that will be used to create the Element, defaults to O3rElement
   * @param options Options supported
   * @param options.index index Select the element associated to the index
   * @param options.shouldThrowIfNotPresent If set to true the function will throw if the element is not present
   * @param options.timeout Duration to wait for the element to be present before it throws
   */
  protected async queryWithOptions(
    selector: string,
    elementConstructor?: O3rElementConstructor<O3rElement>,
    options: {
      index?: number;
      shouldThrowIfNotPresent?: boolean;
      timeout?: number;
    } = {}
  ): Promise<O3rElement | undefined> {
    let element: O3rElement | undefined;
    if (options.index !== undefined) {
      element = await this.queryNth(selector, options.index, elementConstructor as any);
    } else {
      element = await this.query(selector, elementConstructor as any);
    }
    if (options.shouldThrowIfNotPresent) {
      return this.throwOnUndefinedElement<O3rElement>(element, options.timeout);
    }
    return element;
  }

  /**
   * Get text from the element associated to the given selector, or undefined if the element is not found or not visible
   *
   * @param selector Selector to access the element
   * @param options Options supported
   * @param options.elementConstructor Constructor that will be used to create the Element, defaults to O3rElement
   * @param options.index index Select the element associated to the index
   * @param options.shouldThrowIfNotPresent If set to true the function will throw if the element is not present
   * @param options.timeout Duration to wait for the element to be present before it throws
   */
  protected async getText<T extends O3rElement>(selector: string, options: {
    elementConstructor?: O3rElementConstructor<T>;
    index?: number;
    shouldThrowIfNotPresent?: boolean;
    timeout?: number;
  } = {}): Promise<string | undefined> {
    const element = await this.queryWithOptions(selector, options.elementConstructor, options);
    if (!element || !await element.isVisible()) {
      return;
    }
    return await element.getText();
  }

  /**
   * Check if the element associated to the given selector is visible
   *
   * @param selector Selector to access the element
   * @param options Options supported
   * @param options.elementConstructor Constructor that will be used to create the Element, defaults to O3rElement
   * @param options.index index Select the element associated to the index
   * @param options.shouldThrowIfNotPresent If set to true the function will throw if the element is not present
   * @param options.timeout Duration to wait for the element to be present before it throws
   */
  protected async isVisible<T extends O3rElement>(selector: string, options: {
    elementConstructor?: O3rElementConstructor<T> | undefined;
    index?: number;
    shouldThrowIfNotPresent?: boolean;
    timeout?: number;
  } = {}): Promise<boolean> {
    const element = await this.queryWithOptions(selector, options.elementConstructor, options);
    return !!element && await element.isVisible();
  }

  /**
   * Click on the element associated to the given selector if it exists and is visible
   *
   * @param selector Selector to access the element
   * @param options Options supported
   * @param options.elementConstructor Constructor that will be used to create the Element, defaults to O3rElement
   * @param options.index index Select the element associated to the index
   * @param options.shouldThrowIfNotPresent If set to true the function will throw if the element is not present
   * @param options.timeout Duration to wait for the element to be present before it throws
   */
  protected async click<T extends O3rElement>(selector: string, options: {
    elementConstructor?: O3rElementConstructor<T> | undefined;
    index?: number;
    shouldThrowIfNotPresent?: boolean;
    timeout?: number;
  } = {}): Promise<void> {
    const element = await this.queryWithOptions(selector, options.elementConstructor, options);
    if (!!element && await element.isVisible()) {
      await element.click();
    }
  }

  /** @inheritdoc */
  public async query(selector: string, returnType?: undefined): Promise<O3rElement | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    try {
      const elements = this.rootElement.sourceElement.element.locator(selector);
      const element = elements.first();
      const selectedElement: PlaywrightSourceElement = {element: element, page: this.rootElement.sourceElement.page};
      return Promise.resolve(new (returnType || O3rElement)(selectedElement));
    } catch (err) {
      console.warn(`Failed to query ${selector}`, err);
      return Promise.resolve(undefined);
    }
  }

  /** @inheritdoc */
  public async queryNth(selector: string, index: number, returnType?: undefined): Promise<O3rElement | undefined>;
  public async queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public async queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    try {
      const elements = this.rootElement.sourceElement.element.locator(selector);
      const element = elements.nth(index);
      const selectedElement: PlaywrightSourceElement = {element: element, page: this.rootElement.sourceElement.page};
      return Promise.resolve(new (returnType || O3rElement)(selectedElement));
    } catch {
      return Promise.resolve(undefined);
    }
  }

  /** @inheritdoc */
  public async queryAll(_selector: string, _returnType?: undefined, groupType?: undefined, timeout?: number): Promise<O3rElement[]>;
  public async queryAll<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>, groupType?: undefined, timeout?: number): Promise<T[]>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(selector: string, returnType: O3rElementConstructor<T>, groupType: O3rGroupConstructor<K, T>, timeout?: number): Promise<K>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(
    selector: string,
    returnType: O3rElementConstructor<T> | undefined,
    groupType: O3rGroupConstructor<K, T> | undefined,
    timeout = 5000
  ): Promise<(T | O3rElement)[] | K> {
    try {
      const sourceElement = this.rootElement.sourceElement.element;
      const pElements = sourceElement.locator(selector);
      // Mandatory because count is not reliable if we don't wait for the list to be attached
      await pElements.first().waitFor({state: 'attached', timeout});
      const pElementsCount = await pElements.count();
      const elements = [];
      for (let i = 0; i < pElementsCount; i++) {
        const selectedElement: PlaywrightSourceElement = {element: pElements.nth(i), page: this.rootElement.sourceElement.page};
        elements.push(returnType ? new returnType(selectedElement) : new O3rElement(selectedElement));
      }
      if (groupType) {
        const group = new groupType(elements as T[]);
        const isValid = await group.isValidGroup();

        if (!isValid) {
          throw new FixtureUsageError('invalid group of items');
        }
        return group;
      }

      return elements;
    } catch (err) {
      console.warn(`Failed to query all ${selector}`, err);
      return Promise.resolve([]);
    }
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
  public async queryNotPresent(selector: string): Promise<boolean> {
    const element = this.rootElement.sourceElement.element.locator(selector).first();
    return element.isHidden();
  }
}
