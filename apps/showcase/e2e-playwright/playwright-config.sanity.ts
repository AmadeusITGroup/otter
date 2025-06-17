import {
  defineConfig,
} from '@playwright/test';
import {
  default as defaultConfig,
} from './playwright-config';

const config = defineConfig({
  ...defaultConfig,
  testDir: 'sanity',
  snapshotPathTemplate: '{testDir}/../screenshots/sanity/{testFilePath}/{arg}{ext}'
});

export default config;
