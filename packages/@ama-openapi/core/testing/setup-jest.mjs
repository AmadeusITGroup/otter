/**
 * Jest setup file for ESM mode
 * Makes Jest globals available without explicit imports in test files
 */
import * as jestGlobals from '@jest/globals';

// Make all Jest globals available
globalThis.jest = jestGlobals.jest;
globalThis.expect = jestGlobals.expect;
globalThis.describe = jestGlobals.describe;
globalThis.it = jestGlobals.it;
globalThis.test = jestGlobals.test;
globalThis.beforeEach = jestGlobals.beforeEach;
globalThis.afterEach = jestGlobals.afterEach;
globalThis.beforeAll = jestGlobals.beforeAll;
globalThis.afterAll = jestGlobals.afterAll;
