#!/usr/bin/env node

import type {
  CliWrapper,
} from '@o3r/telemetry';
import * as minimist from 'minimist';
import * as prompts from 'prompts';
import {
  amaYargs,
} from '../modules/base-yargs';

const run = async () => {
  const override = await amaYargs(minimist(process.argv.slice(2)));
  return (prompts as any).override(override.argv);
};

void (async () => {
  let wrapper: CliWrapper = (fn: any) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  return wrapper(run, '@ama-terasu/cli:ama')();
})();
