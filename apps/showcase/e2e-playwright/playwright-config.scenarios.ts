import {
  defineConfig,
} from '@playwright/test';
import defaultConfig from './playwright-config';

const config = defineConfig({
  ...defaultConfig,
  testDir: 'scenarios',
  snapshotPathTemplate: '{testDir}/../screenshots/scenarios/{testFilePath}/{arg}{ext}'
});

export default config;
