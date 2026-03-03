#!/usr/bin/env node

/*
 * Extract domains from OpenAPI specification and generate SDK_CONTEXT.md
 * for AI tools to understand the SDK structure and avoid hallucinations.
 */

import {
  resolve,
} from 'node:path';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import * as minimist from 'minimist';
import {
  generateSdkContext,
} from './genai-context/update-sdk-context.cjs';

const argv = minimist(process.argv.slice(2));
const help = !!argv.help;
const quiet = !!argv.quiet;
const isInteractive = !!argv.interactive || !!argv.i;
const domainDescriptionsFile = argv['domain-descriptions'] as string | undefined;
const specPathArg = argv['spec-path'] as string | undefined;
const prepareScript = argv['prepare-script'] as boolean | undefined;
const sdkPath = argv['sdk-path'] as string | undefined;
const projectPath = sdkPath ? resolve(process.cwd(), sdkPath) : resolve(process.cwd());
const noop = () => {};
// eslint-disable-next-line no-console -- only logger available
const logger = quiet ? { error: console.error, warn: noop, log: noop, info: noop, debug: noop } : console;

const run = async () => {
  await generateSdkContext(projectPath, specPathArg, domainDescriptionsFile, isInteractive, prepareScript, logger);
};
if (help) {
  // eslint-disable-next-line no-console -- Help output should always be visible even with --quiet flag
  console.log(`Extract domains from OpenAPI specification and generate SDK_CONTEXT.md for AI tools.
  Usage: amasdk-update-sdk-context [options]

  Options:
    --interactive, -i       Run in interactive mode to validate domains and add disambiguation notes
    --domain-descriptions   Path to JSON file with custom domain descriptions
                            Format: { "domainName": "description", ... }
                            Missing domains will fallback to OpenAPI tag descriptions
    --spec-path             Path to OpenAPI specification file (default: open-api.yaml or open-api.json in project root)
    --prepare-script        Add a prepare:context script to package.json that copies SDK_CONTEXT.md to dist folder
    --sdk-path              Path to SDK directory where SDK_CONTEXT.md will be created and package.json will be modified
                            (default: current directory)
    --quiet                 Suppress non-essential output
    --help                  Show this help message
  `);
  process.exit(0);
}

void (async () => {
  let wrapper: CliWrapper = (fn) => fn;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    wrapper = createCliWithMetrics;
  } catch {
    // Do not throw if `@o3r/telemetry` is not installed
  }
  await wrapper(run, '@ama-sdk/schematics:update-sdk-context')();
})();
