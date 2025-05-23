import {
  defineConfig,
} from '@playwright/test';
import {
  default as defaultConfig,
} from './playwright-config';

const config = defineConfig({
  ...defaultConfig,
  testDir: 'scenarios',
  snapshotPathTemplate: '{testDir}/../screenshots/scenarios/{testFilePath}/{arg}{ext}'
});

export default config;
