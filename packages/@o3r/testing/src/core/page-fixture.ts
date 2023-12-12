import { TranspilationPurposeOnlyError } from '../errors/index';
import { ComponentFixtureProfile, O3rComponentFixture } from './component-fixture';
import { ElementProfile, O3rElement } from './element';

/**
 * Interface to describe a page fixture.
 */
export interface PageFixtureProfile<V extends ElementProfile> extends ComponentFixtureProfile<V> {
  /**
   * Returns the title of the page
   */
  getTitle(): Promise<string>;
}

/**
 * Mock for page fixture class.
 * This class is used for fixture compilation purpose.
 */
export class O3rPageFixture<V extends O3rElement = O3rElement> extends O3rComponentFixture<V> implements PageFixtureProfile<V> {
  /**
   * Root element of this fixture. Optional in a Protractor.
   * All further queries will be applied to the element tree if any, otherwise they will be applied to the whole DOM.
   * @param _rootElement
   */
  constructor(_rootElement?: V) {
    super();
  }

  public getTitle(): Promise<string> {
    throw new TranspilationPurposeOnlyError('Should target Protractor implementation');
  }
}
