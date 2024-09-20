import {browser} from 'protractor';
import {PageFixtureProfile} from '../page-fixture';
import {O3rComponentFixture} from './component-fixture';
import {O3rElement} from './element';
import {convertPromise} from './utils';

export {PageFixtureProfile} from '../page-fixture';

/**
 * Implementation of the page fixture dedicated to protractor.
 * @deprecated Will be removed in v13, please use Playwright instead
 */
export class O3rPageFixture<V extends O3rElement = O3rElement> extends O3rComponentFixture<V> implements PageFixtureProfile<V> {
  constructor(rootElement?: V) {
    super(rootElement);
  }

  public getTitle() {
    return convertPromise(browser.getTitle());
  }
}
