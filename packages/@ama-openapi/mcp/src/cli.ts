#!/usr/bin/env node

import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  MCPLogger,
} from '@ama-mcp/core';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';
import type {
  CliWrapper,
} from '@o3r/telemetry';
import type {
  PackageJson,
} from 'type-fest';
import {
  createOpenApiMcpServer,
} from './server/mcp-server';

/**
 * Read the `name` and `version` fields from this package's `package.json`.
 * @returns An object containing the package name and version.
 */
export const getPackageInfo = (): PackageJson => {
  const packageJsonPath = resolve(__dirname, '..', 'package.json');
  return JSON.parse(readFileSync(packageJsonPath, { encoding: 'utf8' }));
};

void (async () => {
  const { name, version } = getPackageInfo();
  const logger = new MCPLogger(name!);

  const run = async (): Promise<void> => {
    try {
      const server = await createOpenApiMcpServer({ logger, name, version });

      const transport = new StdioServerTransport();
      await server.connect(transport);
    } catch (error) {
      logger.error?.('Failed to start OpenAPI MCP server:', error);
      throw error;
    }
  };

  let runner: CliWrapper | undefined;
  try {
    const { createCliWithMetrics } = await import('@o3r/telemetry');
    runner = createCliWithMetrics;
  } catch (error) {
    logger.warn('Failed to load telemetry module, running CLI without metrics:', error);
  }

  await (runner ? runner(run, name!)() : run());
})();
