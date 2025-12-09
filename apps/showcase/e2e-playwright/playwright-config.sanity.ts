import {
  defineConfig,
} from '@playwright/test';
import defaultConfig from './playwright-config';

const config = defineConfig({
  ...defaultConfig,
  testDir: 'sanity',
  snapshotPathTemplate: '{testDir}/../screenshots/sanity/{testFilePath}/{arg}{ext}'
});

export default config;
