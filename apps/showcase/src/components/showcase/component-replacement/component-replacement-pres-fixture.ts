import {
  ComponentFixtureProfile,
  O3rComponentFixture,
  O3rElement,
} from '@o3r/testing/core';

/**
 * A component fixture abstracts all the interaction you can have with the component's DOM
 * for testing purpose, including instantiating the fixtures of sub-components.
 * It should be used both for component testing and automated testing.
 */
export interface ComponentReplacementPresFixture extends ComponentFixtureProfile {
  /** Get Date */
  getDate: () => Promise<O3rElement | undefined>;
  /** Get Date input */
  getDateInput: () => Promise<O3rElement | undefined>;
}

export class ComponentReplacementPresFixtureComponent extends O3rComponentFixture implements ComponentReplacementPresFixture {
  /** @inheritDoc */
  public getDate() {
    return this.query('#component-replacement-date');
  }

  /** @inheritDoc */
  public getDateInput() {
    return this.query('#date-outbound');
  }
}
