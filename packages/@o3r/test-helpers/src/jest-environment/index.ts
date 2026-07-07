import {
  rm,
} from 'node:fs/promises';
import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import type {
  Circus,
} from '@jest/types';
import {
  redBright,
} from 'chalk';
import {
  TestEnvironment as NodeTestEnvironment,
} from 'jest-environment-node';
import {
  prepareTestEnv,
  type PrepareTestEnvType,
} from '../prepare-test-env';
import {
  isVerdaccioInUse,
} from '../utilities';

/**
 *  Return type of prepareTestEnv
 */
export type TestEnvironment = Awaited<ReturnType<typeof prepareTestEnv>>;

declare global {
  var o3rEnvironment: { testEnvironment: TestEnvironment };
}

/**
 * Custom Jest environment used to manage test environments with Verdaccio setup
 */
export class JestEnvironmentO3r extends NodeTestEnvironment {
  /**
   * Folder containing the generated files
   */
  private readonly appFolder: string;

  /**
   * Increment used in folder name in case of multiples tests
   */
  private appIndex = 0;

  /**
   * Type of test environment to be created
   */
  private readonly prepareTestEnvType: PrepareTestEnvType | undefined;

  /**
   * Map test name with test environment
   */
  private readonly testEnvironments: Record<string, TestEnvironment> = {};

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    // testEnvironment is undefined now but will be defined when test runs
    this.global.o3rEnvironment = {} as typeof this.global.o3rEnvironment;
    this.appFolder = context.docblockPragmas['jest-environment-o3r-app-folder'] as string;
    this.prepareTestEnvType = context.docblockPragmas['jest-environment-o3r-type'] as PrepareTestEnvType | undefined;
  }

  /**
   * Catch Jest lifecycle events
   * @param event
   * @param _state
   */
  public async handleTestEvent(event: Circus.AsyncEvent, _state: Circus.State) {
    // Create test environment before test starts
    if (event.name === 'test_start') {
      const appFolder = `${this.appFolder}${this.appIndex++ || ''}`;
      this.testEnvironments[event.test.name] = await prepareTestEnv(appFolder, { type: this.prepareTestEnvType });
      this.global.o3rEnvironment.testEnvironment = this.testEnvironments[event.test.name];
    }
    // Cleanup test environment after test succeeds
    if (event.name === 'test_fn_success' && this.testEnvironments[event.test.name]?.workspacePath) {
      try {
        await rm(this.testEnvironments[event.test.name].workspacePath, { recursive: true });
      } catch { /* ignore error */ }
    }
  }

  /**
   * Executed before any test starts
   */
  public async setup() {
    if (!isVerdaccioInUse()) {
      throw new Error(`:
${redBright('Error: Verdaccio is not running.')}
Please set it up with the following commands:
 - verdaccio:start or verdaccio:start-local
 - verdaccio:publish
`);
    }
    await super.setup();
  }
}

export default JestEnvironmentO3r;
