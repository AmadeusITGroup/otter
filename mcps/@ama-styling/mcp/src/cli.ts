#!/usr/bin/env node
import {
  type LogLevel,
  MCPLogger,
} from '@ama-mcp/core';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/server/stdio';
import {
  createCliWithMetrics,
} from '@o3r/telemetry';
import {
  Command,
} from 'commander';
import {
  createStylingMcpServer,
} from './server/mcp-server';

const run = async (): Promise<void> => {
  const program = new Command();
  program
    .name('ama-styling-mcp-start')
    .description(
      'Design Tokens MCP Server\n\n'
      + 'Exposes design token metadata to AI assistants for token discovery and recommendation.'
    )
    .option('-m, --metadata <path>', 'Path to the styling.metadata.json file', './styling.metadata.json')
    .option('--cache-path <path>', 'Path to the cache file', '.cache/@ama-styling/mcp')
    .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info');

  const { metadata, cachePath, logLevel } = program.parse().opts<{
    metadata: string;
    cachePath: string;
    logLevel: LogLevel;
  }>();
  const logger = new MCPLogger('@ama-styling/mcp', logLevel);

  try {
    const server = await createStylingMcpServer(
      {
        metadataPath: metadata,
        cacheFilePath: cachePath
      },
      logger
    );
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Server connected...');
  } catch (error) {
    logger.error('Failed to start Design Tokens MCP server:', error);
    throw error;
  }
};

void createCliWithMetrics(run, '@ama-styling/mcp')();
