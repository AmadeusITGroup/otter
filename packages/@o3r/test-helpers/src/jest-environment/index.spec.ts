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
  prepareTestEnv,
} from '../prepare-test-env';
import {
  JestEnvironmentO3r,
} from './index';

jest.mock('node:fs/promises', () => ({ rm: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../prepare-test-env', () => ({ prepareTestEnv: jest.fn() }));
jest.mock('../utilities', () => ({ isVerdaccioInUse: jest.fn().mockReturnValue(true) }));
jest.mock('jest-environment-node', () => ({
  TestEnvironment: class {
    public global: Record<string, any> = {};
  }
}));

const createEnvironment = (pragmas: Record<string, string>) =>
  new JestEnvironmentO3r({} as JestEnvironmentConfig, { docblockPragmas: pragmas } as unknown as EnvironmentContext);

const state = {} as Circus.State;
const createTestEvent = (name: 'test_start' | 'test_fn_success' | 'test_done', testName: string, errors: unknown[] = []) =>
  ({ name, test: { name: testName, errors } }) as unknown as Circus.AsyncEvent;

describe('JestEnvironmentO3r', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prepareTestEnv as jest.Mock).mockImplementation((folderName: string) => Promise.resolve({ folderName, workspacePath: `/it-tests/${folderName}` }));
  });

  describe('with default test scope', () => {
    it('should create a test environment for each test and clean it after success', async () => {
      const environment = createEnvironment({ 'jest-environment-o3r-app-folder': 'test-app', 'jest-environment-o3r-type': 'blank' });

      await environment.handleTestEvent({ name: 'run_start' }, state);
      expect(prepareTestEnv).not.toHaveBeenCalled();

      await environment.handleTestEvent(createTestEvent('test_start', 'first'), state);
      expect(environment.global.o3rEnvironment.testEnvironment.folderName).toBe('test-app');
      await environment.handleTestEvent(createTestEvent('test_fn_success', 'first'), state);
      expect(rm).toHaveBeenCalledWith('/it-tests/test-app', { recursive: true });

      await environment.handleTestEvent(createTestEvent('test_start', 'second'), state);
      expect(environment.global.o3rEnvironment.testEnvironment.folderName).toBe('test-app1');
      expect(prepareTestEnv).toHaveBeenCalledTimes(2);
      expect(prepareTestEnv).toHaveBeenCalledWith('test-app1', { type: 'blank' });
    });
  });

  describe('with file scope', () => {
    const pragmas = { 'jest-environment-o3r-app-folder': 'test-app', 'jest-environment-o3r-scope': 'file' };

    it('should create a single test environment shared by all the tests', async () => {
      const environment = createEnvironment(pragmas);

      await environment.handleTestEvent({ name: 'run_start' }, state);
      expect(prepareTestEnv).toHaveBeenCalledTimes(1);
      expect(prepareTestEnv).toHaveBeenCalledWith('test-app', { type: undefined });
      const testEnvironment = environment.global.o3rEnvironment.testEnvironment;
      expect(testEnvironment.workspacePath).toBe('/it-tests/test-app');

      await environment.handleTestEvent(createTestEvent('test_start', 'first'), state);
      await environment.handleTestEvent(createTestEvent('test_fn_success', 'first'), state);
      await environment.handleTestEvent(createTestEvent('test_done', 'first'), state);
      await environment.handleTestEvent(createTestEvent('test_start', 'second'), state);

      expect(prepareTestEnv).toHaveBeenCalledTimes(1);
      expect(rm).not.toHaveBeenCalled();
      expect(environment.global.o3rEnvironment.testEnvironment).toBe(testEnvironment);
    });

    it('should clean the test environment at the end of the run when all tests succeeded', async () => {
      const environment = createEnvironment(pragmas);

      await environment.handleTestEvent({ name: 'run_start' }, state);
      await environment.handleTestEvent(createTestEvent('test_done', 'first'), state);
      await environment.handleTestEvent({ name: 'run_finish' }, state);

      expect(rm).toHaveBeenCalledWith('/it-tests/test-app', { recursive: true });
    });

    it('should keep the test environment when a test failed', async () => {
      const environment = createEnvironment(pragmas);

      await environment.handleTestEvent({ name: 'run_start' }, state);
      await environment.handleTestEvent(createTestEvent('test_done', 'first', [new Error('failure')]), state);
      await environment.handleTestEvent(createTestEvent('test_done', 'second'), state);
      await environment.handleTestEvent({ name: 'run_finish' }, state);

      expect(rm).not.toHaveBeenCalled();
    });

    it('should keep the test environment when a hook failed', async () => {
      const environment = createEnvironment(pragmas);

      await environment.handleTestEvent({ name: 'run_start' }, state);
      await environment.handleTestEvent({ name: 'hook_failure' } as Circus.AsyncEvent, state);
      await environment.handleTestEvent({ name: 'run_finish' }, state);

      expect(rm).not.toHaveBeenCalled();
    });
  });
});
