/* eslint-disable new-cap */
import { By } from '@angular/platform-browser';
import { FixtureUsageError } from '../../errors/index';
import type { ComponentFixtureProfile } from '../component-fixture';
import { isPromise, withTimeout } from '../helpers';
import { O3rElement, O3rElementConstructor } from './element';
import { O3rGroup, O3rGroupConstructor } from './group';

export type { ComponentFixtureProfile, Constructable, FixtureWithCustom } from '../component-fixture';

/**
 * Implementation of the fixture dedicated to angular, hence using angular testing framework.
 */
export class O3rComponentFixture<V extends O3rElement = O3rElement> implements ComponentFixtureProfile<V> {
  /**
   * DOM element linked to the fixture.
   */
  protected element: V;

  /**
   * Root element of this fixture. It will be used as the context for further queries.
   *
   * @param element
   */
  constructor(element: V) {
    this.element = element;
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @param _timeout specific timeout that will throw when reach
   */
  protected throwOnUndefinedElement<T extends O3rElement>(element?: T, _timeout?: number): Promise<T> {
    if (!element) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    return Promise.resolve(element);
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @deprecated use {@link Promise} only as {@link throwOnUndefined} parameter or use {@see throwOnUndefinedElement} instead. Will be removed in v10
   */
  protected throwOnUndefined<T extends O3rElement>(element?: T): T;
  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @param timeout specific timeout that will throw when reach
   */
  protected async throwOnUndefined<T extends O3rElement>(element: Promise<T | undefined>, timeout?: number): Promise<T>;
  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param element ElementProfile to test
   * @param timeout specific timeout that will throw when reach
   * @deprecated use {@link Promise} only as {@link throwOnUndefined} parameter or use {@link throwOnUndefinedElement} instead. Will be removed in v10
   */
  protected throwOnUndefined<T extends O3rElement>(element?: Promise<T | undefined> | T, timeout?: number): Promise<T> | T {
    if (!element) {
      throw new Error('Element not found in ' + this.constructor.name);
    }
    if (isPromise(element)) {
      return withTimeout(element, timeout)
        .then((el) => {
          if (!el) {
            throw new Error('Element not found in ' + this.constructor.name);
          }
          return el;
        });
    }
    return element;
  }

  /** @inheritdoc */
  public query(selector: string, returnType?: undefined): Promise<O3rElement | undefined>;
  public query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public query<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    const queriedElement = this.element.sourceElement.query(By.css(selector));
    return Promise.resolve(queriedElement ? (returnType ? new returnType(queriedElement) : new O3rElement(queriedElement)) : undefined);
  }

  /** @inheritdoc */
  public queryNth(selector: string, index: number, returnType?: undefined): Promise<O3rElement | undefined>;
  public queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public queryNth<T extends O3rElement>(selector: string, index: number, returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    const queriedElement = this.element.sourceElement.queryAll(By.css(selector))[index];
    return Promise.resolve(queriedElement ? (returnType ? new returnType(queriedElement) : new O3rElement(queriedElement)) : undefined);
  }

  /** @inheritdoc */
  public async queryAll(_selector: string, _returnType?: undefined, groupType?: undefined, _timeout?: number): Promise<O3rElement[]>;
  public async queryAll<T extends O3rElement>(selector: string, returnType: O3rElementConstructor<T>, groupType?: undefined, _timeout?: number): Promise<T[]>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(selector: string, returnType: O3rElementConstructor<T>, groupType: O3rGroupConstructor<K, T>, _timeout?: number): Promise<K>;
  public async queryAll<T extends O3rElement, K extends O3rGroup<T>>(
    selector: string,
    returnType: O3rElementConstructor<T> | undefined,
    groupType: O3rGroupConstructor<K, T> | undefined,
    _timeout?: number
  ): Promise<(T | O3rElement)[] | K> {
    const queriedElement = this.element.sourceElement.queryAll(By.css(selector));

    const elements = queriedElement.map((el) => (returnType ? new returnType(el) : new O3rElement(el)));
    if (groupType) {
      const group = new groupType(elements as T[]);
      const isValid = await group.isValidGroup();

      if (!isValid) {
        throw new FixtureUsageError('invalid group of items');
      }
      return Promise.resolve(group);
    }

    return Promise.resolve(elements);
  }

  /** @inheritdoc */
  public getElement() {
    return this.element;
  }

  /** @inheritdoc */
  public getSubComponents(): Promise<{[componentName: string]: ComponentFixtureProfile[]}> {
    return Promise.resolve({block: [this]});
  }

  /** @inheritDoc */
  public queryNotPresent(selector: string, _timeout?: number): Promise<boolean> {
    return Promise.resolve(!this.element.sourceElement.query(By.css(selector)));
  }
}
