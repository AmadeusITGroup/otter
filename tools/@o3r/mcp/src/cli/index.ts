#!/usr/bin/env node
import {
  logger,
} from '@ama-mcp/core';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createMcpServer,
} from '../mcp-server';

async function startMcpServer() {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Server connected...');
}

void startMcpServer();
