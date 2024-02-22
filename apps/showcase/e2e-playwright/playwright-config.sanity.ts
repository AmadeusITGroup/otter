import { defineConfig } from '@playwright/test';
import * as path from 'node:path';

import {default as defaultConfig} from './playwright-config';

const config = defineConfig({
  ...defaultConfig,
  testDir: path.join(__dirname, 'sanity'),
  testMatch: /.*\.e2e\.ts$/
});

export default config;
