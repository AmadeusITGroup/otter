import {
  ComponentFixtureProfile,
  O3rComponentFixture
} from '@o3r/testing/core';

/**
 * A component fixture abstracts all the interaction you can have with the component's DOM
 * for testing purpose, including instantiating the fixtures of sub-components.
 * It should be used both for component testing and automated testing.
 */
export interface SidenavPresFixture extends ComponentFixtureProfile {
  /**
   * Click on the link on the selected index
   * @param index index of the link
   */
  clickOnLink(index: number): Promise<void>;
}

export class SidenavPresFixtureComponent extends O3rComponentFixture implements SidenavPresFixture {
  /** @inheritDoc */
  public async clickOnLink(index: number) {
    const link = await this.queryNth('a', index);
    if (!link) {
      throw new Error(`Cannot find side-nav link with index ${index}`);
    }
    await link.click();
  }
}
