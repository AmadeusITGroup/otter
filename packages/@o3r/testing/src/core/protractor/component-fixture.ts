import {
  browser,
  By,
  element,
  ElementFinder
} from 'protractor';
import {
  FixtureUsageError
} from '../../errors/index';
import type {
  ComponentFixtureProfile
} from '../component-fixture';
import {
  withTimeout
} from '../helpers';
import {
  O3rElement,
  O3rElementConstructor
} from './element';
import {
  O3rGroup,
  O3rGroupConstructor
} from './group';
import {
  convertPromise
} from './utils';

/**
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export type { ComponentFixtureProfile, Constructable, FixtureWithCustom } from '../component-fixture';

/**
 * Implementation of the fixture dedicated to protractor, hence using the webdriver to interact with the dom.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rComponentFixture<V extends O3rElement = O3rElement> implements ComponentFixtureProfile<V> {
  /**
   * DOM element linked to the fixture.
   */
  protected rootElement?: V;

  /**
   * Root element of this fixture. Optional in a Protractor.
   * All further queries will be applied to the element tree if any, otherwise they will be applied to the whole DOM.
   * @param rootElement
   */
  constructor(rootElement?: V) {
    this.rootElement = rootElement;
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   * @param elemnt ElementProfile to test
   * @param _timeout specific timeout that will throw when reach
   */
  protected throwOnUndefinedElement<T extends O3rElement>(elemnt?: T, _timeout?: number): Promise<T> {
    if (!elemnt) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    return Promise.resolve(elemnt);
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   * @param elemnt ElementProfile to test
   * @param timeout specific timeout that will throw when reach
   */
  protected async throwOnUndefined<T extends O3rElement>(elemnt: Promise<T | undefined>, timeout?: number): Promise<T> {
    return withTimeout(elemnt, timeout)
      .then((el) => {
        if (!el) {
          throw new Error('Element not found in ' + this.constructor.name);
        }
        return el;
      });
  }

  /**
   * Get the element associated to the selector if present
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
    const queryElement: O3rElement | undefined = await (
      options.index === undefined
        ? this.query(selector, elementConstructor as any)
        : this.queryNth(selector, options.index, elementConstructor as any)
    );
    if (options.shouldThrowIfNotPresent) {
      return this.throwOnUndefinedElement<O3rElement>(queryElement, options.timeout);
    }
    return queryElement;
  }

  /**
   * Get text from the element associated to the given selector, or undefined if the element is not found or not visible
   * @param selector Selector to access the element
   * @param options Options supported
   * @param options.elementConstructor Constructor that will be used to create the Element, defaults to O3rElement
   * @param options.index index Select the element associated to the index
   * @param options.shouldThrowIfNotPresent If set to true the function will throw if the element is not present
   * @param options.timeout Duration to wait for the element to be present before it throws
   */
  protected async getText<T extends O3rElement>(selector: string, options: {
    elementConstructor?: O3rElementConstructor<T> | undefined;
    index?: number;
    shouldThrowIfNotPresent?: boolean;
    timeout?: number;
  } = {}): Promise<string | undefined> {
    const getTextElement = await this.queryWithOptions(selector, options.elementConstructor, options);
    if (!getTextElement || !await getTextElement.isVisible()) {
      return;
    }
    return await getTextElement.getText();
  }

  /**
   * Check if the element associated to the given selector is visible
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
    const isVisibleElement = await this.queryWithOptions(selector, options.elementConstructor, options);
    return !!isVisibleElement && await isVisibleElement.isVisible();
  }

  /**
   * Click on the element associated to the given selector if it exists and is visible
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
    const clickElement = await this.queryWithOptions(selector, options.elementConstructor, options);
    if (!!clickElement && await clickElement.isVisible()) {
      await clickElement.click();
    }
  }

  /** @inheritdoc */
  public async query(selector: string, returnType?: undefined): Promise<O3rElement | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public async query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    const sourceElement = this.rootElement && this.rootElement.sourceElement;
    const cssSelector = By.css(selector);
    const isElPresent = await (sourceElement ? sourceElement.isElementPresent(cssSelector) : browser.isElementPresent(cssSelector));
    if (!isElPresent) {
      // eslint-disable-next-line no-console -- no other logger available
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
      // eslint-disable-next-line no-console -- no other logger available
      console.warn(`No component matching ${selector}:nth(${index}) found`);
      return;
    }
    return new (returnType || O3rElement)(item);
  }

  /** @inheritdoc */
  public async queryAll(_selector: string, _returnType?: undefined, groupType?: undefined, timeout?: number): Promise<O3rElement[]>;
  public async queryAll<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>, groupType?: undefined, timeout?: number): Promise<T[]>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(selector: string, returnType: O3rElementConstructor<T>, groupType: O3rGroupConstructor<K, T>, timeout?: number): Promise<K>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(
    selector: string,
    returnType: O3rElementConstructor<T> | undefined,
    groupType: O3rGroupConstructor<K, T> | undefined,
    _timeout?: number
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
  public getSubComponents(): Promise<{ [componentName: string]: ComponentFixtureProfile[] }> {
    return Promise.resolve({ block: [this] });
  }

  /** @inheritDoc */
  public async queryNotPresent(selector: string, _timeout?: number): Promise<boolean> {
    const sourceElement = this.rootElement && this.rootElement.sourceElement;
    return !(await (sourceElement || browser).isElementPresent(By.css(selector)));
  }
}
