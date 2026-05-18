#!/usr/bin/env node

import {
  MCPLogger,
} from '@ama-mcp/core';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createCliWithMetrics,
} from '@o3r/telemetry';
import {
  Command,
} from 'commander';
import {
  isValidPackageName,
} from './helpers/utils';
import {
  createSdkContextServer,
} from './server/mcp-server';

const run = async (): Promise<void> => {
  const logger = new MCPLogger('@ama-mcp/sdk');

  /**
   * Validate and filter package names, logging warnings for invalid ones
   * @param packageNames Raw package names from CLI
   * @returns Validated package names
   */
  const validatePackages = (packageNames: string[]): string[] =>
    packageNames.filter((pkg) => {
      const isValid = isValidPackageName(pkg);
      if (!isValid) {
        logger.warn?.(`Invalid package name "${pkg}", skipping`);
      }
      return isValid;
    });

  /**
   * CLI program configuration using Commander.js
   *
   * Sets up the command-line interface with options and help text for the SDK Context MCP server.
   */
  const program = new Command();
  program
    .name('ama-mcp-sdk')
    .description('SDK Context MCP Server\n\nExposes SDK_CONTEXT.md from installed packages to AI assistants.')
    .option('-p, --packages <packages...>', 'List of SDK package names to expose (required if not configured in package.json)')
    .addHelpText('after', `
Examples:
  ama-mcp-sdk --packages @my-scope/my-sdk @other-scope/other-sdk

VS Code mcp.json example:
  {
    "servers": {
      "sdk-context": {
        "command": "npx",
        "args": ["ama-mcp-sdk", "--packages", "@my-scope/my-sdk", "@other-scope/other-sdk"]
      }
    }
  }`);

  /**
   * Parse CLI arguments and validate package names
   *
   * Extracts package names from command line arguments and validates them using
   * the package name validation rules.
   */
  const { packages: rawPackages } = program.parse().opts();
  const packages = validatePackages(rawPackages || []);

  /**
   * Main entry point for the SDK Context MCP server
   *
   * Initializes and starts the MCP server with SDK context tools and resources.
   * The server exposes SDK_CONTEXT.md files from configured packages to AI assistants.
   * @returns Promise that resolves when the server is successfully started
   */
  try {
    const server = createSdkContextServer({
      sdkPackages: packages.length > 0 ? packages : undefined,
      logger
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
  } catch (error) {
    logger.error?.('Failed to start SDK Context MCP server:', error);
    throw error;
  }
};
void createCliWithMetrics(run, '@ama-sdk/cli')();
