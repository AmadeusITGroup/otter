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
 * Implementation of the page fixture dedicated to Playwright.
 */
export class O3rPageFixture<V extends O3rElement = O3rElement> extends O3rComponentFixture<V> implements PageFixtureProfile<V> {
  constructor(rootElement: V) {
    super(rootElement);
  }

  public async getTitle() {
    return await this.rootElement.sourceElement.page.title();
  }
}
