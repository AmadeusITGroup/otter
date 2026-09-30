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

/**
 * Scope of the test environment:
 * - 'test' (default) a new test environment is created for each test
 * - 'file' a single test environment is created before any hook or test of the file and is shared by all of them
 */
export type TestEnvironmentScope = 'test' | 'file';

declare global {
  var o3rEnvironment: { testEnvironment: TestEnvironment };
}

/**
 * Get the value of a docblock pragma as a string
 * @param pragma
 */
const getPragmaValue = (pragma: string | string[] | undefined) => Array.isArray(pragma) ? pragma[0] : pragma;

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
   * Scope of the test environment
   */
  private readonly scope: TestEnvironmentScope;

  /**
   * Map test name with test environment
   */
  private readonly testEnvironments: Record<string, TestEnvironment> = {};

  /**
   * Test environment shared by all the tests of the file (only when scope is 'file')
   */
  private fileTestEnvironment?: TestEnvironment;

  /**
   * Determine if a test or a hook failed in the file (only used when scope is 'file')
   */
  private hasFailure = false;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    // testEnvironment is undefined now but will be defined when test runs
    this.global.o3rEnvironment = {} as typeof this.global.o3rEnvironment;
    this.appFolder = getPragmaValue(context.docblockPragmas['jest-environment-o3r-app-folder']) as string;
    this.prepareTestEnvType = getPragmaValue(context.docblockPragmas['jest-environment-o3r-type']) as PrepareTestEnvType | undefined;
    this.scope = getPragmaValue(context.docblockPragmas['jest-environment-o3r-scope']) === 'file' ? 'file' : 'test';
  }

  /**
   * Handle Jest lifecycle events when the test environment is shared by all the tests of the file
   * @param event
   */
  private async handleFileScopeTestEvent(event: Circus.AsyncEvent) {
    switch (event.name) {
      // Create the test environment before any hook (beforeAll included) or test starts
      case 'run_start': {
        this.fileTestEnvironment = await prepareTestEnv(this.appFolder, { type: this.prepareTestEnvType });
        this.global.o3rEnvironment.testEnvironment = this.fileTestEnvironment;
        break;
      }
      case 'hook_failure': {
        this.hasFailure = true;
        break;
      }
      case 'test_done': {
        this.hasFailure ||= event.test.errors.length > 0;
        break;
      }
      // Cleanup test environment only if all the tests and hooks succeeded, to be able to investigate failures
      case 'run_finish': {
        if (!this.hasFailure && this.fileTestEnvironment?.workspacePath) {
          try {
            await rm(this.fileTestEnvironment.workspacePath, { recursive: true });
          } catch { /* ignore error */ }
        }
        break;
      }
    }
  }

  /**
   * Catch Jest lifecycle events
   * @param event
   * @param _state
   */
  public async handleTestEvent(event: Circus.AsyncEvent, _state: Circus.State) {
    if (this.scope === 'file') {
      return this.handleFileScopeTestEvent(event);
    }
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
