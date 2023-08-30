import { test } from '@playwright/test';

/**
 * Interface to define the interface of a flow test
 */
export interface Flow {
  /**
   * Run the flow
   */
  performFlow(): void;
}

/**
 * Base scenario for e2e scenarios.
 * Init the fetch manager and call `performFlow` method.
 * E2E Booking flows should inherit from this class.
 */
export abstract class BaseScenario implements Flow {

  public targetUrl = process.env.PLAYWRIGHT_TARGET_URL || 'http://localhost:4200/';

  public abstract performFlow();

  public run() {
    test.describe.serial(this.constructor.name, () => {
      this.performFlow();
    });
  }
}
