import { getTestRule } from 'jest-preset-stylelint';
import * as path from 'node:path';

(globalThis as any).stylelintTestRule = getTestRule({ plugins: [path.resolve(__dirname, '../dist/src/index.js')] });
