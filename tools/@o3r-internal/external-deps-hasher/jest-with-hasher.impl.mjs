/*
 * PROTOTYPE — Option B: execution is unchanged; we only wrap the @nx/jest jest
 * executor so that our executor entry can declare a custom `hasher`. All test
 * behaviour is delegated verbatim to the real jest executor.
 */

import {
  jestExecutor,
// eslint-disable-next-line import/no-unresolved -- deep import into @nx/jest; PnP resolves it at runtime, the linter cannot
} from '@nx/jest/src/executors/jest/jest.impl.js';

/**
 * Delegating executor: forwards to the real jest implementation. Exists only so
 * our executors.json entry can declare a custom hasher alongside it.
 * @type {import('nx/src/config/misc-interfaces').PromiseExecutor}
 */
const runExecutor = async (options, context) => jestExecutor(options, context);

export default runExecutor;
