import {
  ChangeDetectorRef,
} from '@angular/core';

/** A mock function created by the active test runner (Jest `jest.fn` or Vitest `vi.fn`). */
type MockFn = ((...args: any[]) => any) & Record<string, any>;

/**
 * Resolve the active test runner's `fn` factory.
 *
 * Uses whichever runner global is present (`vi` under Vitest with
 * `globals: true`, `jest` under Jest) so this fixture works under either runner
 * without importing one.
 * @returns A function that creates a runner mock.
 */
const getMockFactory = (): (() => MockFn) => {
  const runner = globalThis as typeof globalThis & {
    vi?: { fn: () => MockFn };
    jest?: { fn: () => MockFn };
  };
  const mocker = runner.vi ?? runner.jest;
  if (!mocker) {
    throw new Error(
      'ChangeDetectorRefFixture requires a test runner: neither "vi" (Vitest) nor "jest" (Jest) is available as a global.'
    );
  }
  return () => mocker.fn();
};

/**
 * Fixture for ChangeDetectorRef
 */
export class ChangeDetectorRefFixture implements Readonly<ChangeDetectorRef> {
  public markForCheck: MockFn;
  public detach: MockFn;
  public detectChanges: MockFn;
  public checkNoChanges: MockFn;
  public reattach: MockFn;

  constructor() {
    const fn = getMockFactory();
    this.markForCheck = fn();
    this.detach = fn();
    this.detectChanges = fn();
    this.checkNoChanges = fn();
    this.reattach = fn();
  }
}
