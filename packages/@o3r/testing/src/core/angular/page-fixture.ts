import {
  TranspilationPurposeOnlyError,
} from '../../errors/index';
import {
  PageFixtureProfile,
} from '../page-fixture';
import {
  O3rComponentFixture,
} from './component-fixture';
import {
  O3rElement,
} from './element';

export { PageFixtureProfile } from '../page-fixture';

/**
 * Implementation of the page fixture dedicated to Angular.
 * Pages are not supposed to be used in a Angular environment!
 */
export class O3rPageFixture<V extends O3rElement = O3rElement> extends O3rComponentFixture<V> implements PageFixtureProfile<V> {
  constructor(element: V) {
    super(element);
  }

  /** @inheritdoc */
  public getTitle(): Promise<string> {
    throw new TranspilationPurposeOnlyError('getTitle() operation has no sense in Angular context');
  }
}
