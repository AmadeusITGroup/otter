import { TranspilationPurposeOnlyError } from '../errors/index';
import { ElementProfile, O3rElement, O3rElementConstructor } from './element';
import { GroupProfile, O3rGroupConstructor } from './group';

/**
 * Interface to describe the Component fixture that is used as an abstraction layer to access the DOM of a component.
 * It comes with two implementations that are chosen a build time whether you will use it in a karma or protractor
 * runtime. This way the same fixture is usable for both component and e2e tests.
 */
export interface ComponentFixtureProfile<V extends ElementProfile = ElementProfile> {
  /**
   * Return the  root element of the component fixture.
   */
  getElement(): V | undefined;

  /**
   * Queries an element using the CSS selector passed as argument.
   * If the fixture has a context (was created with a TestBed or Protractor element) the query will be applied
   * to this element's tree only.
   *
   * @param selector CSS selector for the desired element
   * @param returnType Constructor of the element expected
   */
  query(selector: string, returnType?: undefined): Promise<ElementProfile | undefined>;
  query<T extends ElementProfile>(selector: string, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  query<T extends ElementProfile>(selector: string, returnType: O3rElementConstructor<T> | undefined): Promise<T | ElementProfile | undefined>;

  /**
   * Queries the nth element of a list using the CSS selector passed as argument.
   * If the fixture has a context (was created with a TestBed or Protractor element) the query will be applied
   * to this element's tree only.
   *
   * @param selector CSS selector for the desired element
   * @param index Index of the element to retrieve
   * @param returnType Constructor of the element expected
   */
  queryNth(selector: string, index: number, returnType?: undefined): Promise<ElementProfile | undefined>;
  queryNth<T extends ElementProfile>(selector: string, index: number, returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  queryNth<T extends ElementProfile>(selector: string, index: number, returnType: O3rElementConstructor<T> | undefined): Promise<T | ElementProfile | undefined>;

  /**
   * Queries a list of elements using the CSS selector passed as argument.
   * If the fixture has a context (was created with a TestBed or Protractor element) the query will be applied
   * to this element's tree only.
   *
   * @param selector CSS selector for the desired elements
   * @param returnType Constructor of the element expected
   * @param groupType
   * @param timeout
   */
  queryAll(selector: string, returnType?: undefined, groupType?: undefined, timeout?: number): Promise<O3rElement[]>;
  queryAll<T extends ElementProfile>(selector: string, returnType: O3rElementConstructor<T>, groupType?: undefined, timeout?: number): Promise<T[]>;
  queryAll<T extends ElementProfile, K extends GroupProfile<T>>(selector: string, returnType: O3rElementConstructor<T>, groupType: O3rGroupConstructor<K, T>, timeout?: number): Promise<K>;
  queryAll<T extends ElementProfile, K extends GroupProfile<T>>(
    selector: string,
    returnType: O3rElementConstructor<T> | undefined,
    groupType: O3rGroupConstructor<K, T> | undefined,
    timeout?: number
  ): Promise<(T | O3rElement)[] | K>;

  /**
   * Returns the component fixtures corresponding to the sub-components.
   */
  getSubComponents(): Promise<{ [componentName: string]: ComponentFixtureProfile[] }>;

  /**
   * Returns true if the provided selector has no match in the document.
   * A custom timeout value can be passed for asynchronous implementations that support it.
   *
   * @param selector
   * @param timeout
   */
  queryNotPresent(selector: string, timeout?: number): Promise<boolean>;
}

/**
 * Interface to tell typescript that the element which implements
 * it can be used as a prototype
 */
// eslint-disable-next-line no-use-before-define
export type Constructable<T extends ComponentFixtureProfile, U extends FixtureWithCustom = FixtureWithCustom> = new (elem?: ElementProfile, customFixtures?: U) => T;

/**
 * This is the type that has to be extended by each component fixture context
 * It contains the custom fixture type for a component presenter and its subcomponents fixtures contexts
 * key: presenter name
 * fixture: custom presenter type
 * customSubFixtures: custom fixtures for the presenter subcomponents
 */
export interface FixtureWithCustom {
  [fixtureKey: string]: {fixture?: Constructable<ComponentFixtureProfile, FixtureWithCustom>; customSubFixtures?: FixtureWithCustom} | undefined;
}

/**
 * Mock for Component fixture class.
 * This class is used for fixture compilation purpose.
 */
export class O3rComponentFixture<V extends O3rElement = O3rElement> implements ComponentFixtureProfile<V> {
  constructor(_element?: V) {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * Throws an exception if the element is undefined.
   * Otherwise returns the element.
   *
   * @param _element ElementProfile to test
   */
  protected throwOnUndefined<T extends O3rElement>(_element?: T): T {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public query(_selector: string, _returnType?: undefined, timeout?: number): Promise<O3rElement | undefined>;
  public query<T extends O3rElement>(_selector: string, _returnType: O3rElementConstructor<T>, timeout?: number): Promise<T | undefined>;
  public query<T extends O3rElement>(_selector: string, _returnType: O3rElementConstructor<T> | undefined): Promise<T | O3rElement | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public queryAll(_selector: string, _returnType?: undefined, _groupType?: undefined, timeout?: number): Promise<O3rElement[]>;
  public queryAll<T extends O3rElement>(_selector: string, _returnType: O3rElementConstructor<T>, _groupType?: undefined, timeout?: number): Promise<T[]>;
  public queryAll<T extends O3rElement, K extends GroupProfile<T>>(_selector: string, _returnType: O3rElementConstructor<T>, _groupType: O3rGroupConstructor<K, T>, timeout?: number): Promise<K>;
  public queryAll<T extends O3rElement, K extends GroupProfile<T>>(
    _selector: string,
    _returnType: O3rElementConstructor<T> | undefined,
    _groupType: O3rGroupConstructor<K, T> | undefined,
    _timeout?: number
  ): Promise<(T | O3rElement)[] | K> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getElement(): V | undefined {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritdoc */
  public getSubComponents(): Promise<{[componentName: string]: ComponentFixtureProfile[]}> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /** @inheritDoc */
  public queryNotPresent(_selector: string, _timeout?: number): Promise<boolean> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }

  /**
   * @inheritDoc
   */
  public queryNth(_selector: string, _index: number, _returnType?: undefined): Promise<ElementProfile | undefined>;
  public queryNth<T extends ElementProfile>(_selector: string, _index: number, _returnType: O3rElementConstructor<T>): Promise<T | undefined>;
  public queryNth<T extends ElementProfile>(_selector: string, _index: number, _returnType: O3rElementConstructor<T> | undefined): Promise<T | ElementProfile | undefined> {
    throw new TranspilationPurposeOnlyError('Should target a proper implementation');
  }
}
