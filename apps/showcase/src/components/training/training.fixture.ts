import {
  ComponentFixtureProfile,
  O3rComponentFixture,
} from '@o3r/testing/core';

/**
 * A component fixture abstracts all the interaction you can have with the component's DOM
 * for testing purpose, including instantiating the fixtures of sub-components.
 * It should be used both for component testing and automated testing.
 */
export interface TrainingFixture extends ComponentFixtureProfile {
  /** Click on previous step button */
  clickOnPreviousStep: () => Promise<void>;
  /** Click on next step button */
  clickOnNextStep: () => Promise<void>;
}

export class TrainingFixtureComponent extends O3rComponentFixture implements TrainingFixture {
  /** @inheritDoc */
  public async clickOnPreviousStep() {
    return (await this.query('#training-exercise-previous-step'))?.click();
  }

  /** @inheritDoc */
  public async clickOnNextStep() {
    return (await this.query('#training-exercise-next-step'))?.click();
  }
}
