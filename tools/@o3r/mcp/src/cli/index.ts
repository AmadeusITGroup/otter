#!/usr/bin/env node
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createMcpServer,
} from '../mcp-server';
import {
  logger,
} from '../utils/logger';

async function startMcpServer() {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Server connected...');
}

void startMcpServer();
