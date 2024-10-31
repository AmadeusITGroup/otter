import {
  ComponentFixtureProfile,
  O3rComponentFixture,
  O3rElement
} from '@o3r/testing/core';

/**
 * A component fixture abstracts all the interaction you can have with the component's DOM
 * for testing purpose, including instantiating the fixtures of sub-components.
 * It should be used both for component testing and automated testing.
 */
export interface ConfigurationFixture extends ComponentFixtureProfile {
  /** Get Override button */
  getOverrideButton: () => Promise<O3rElement | undefined>;
  /** Get Clear override button */
  getClearOverrideButton: () => Promise<O3rElement | undefined>;
}

export class ConfigurationFixtureComponent extends O3rComponentFixture implements ConfigurationFixture {
  /** @inheritDoc */
  public getOverrideButton() {
    return this.query('#btn-override-config');
  }

  /** @inheritDoc */
  public getClearOverrideButton() {
    return this.query('#btn-clear-override-config');
  }
}
