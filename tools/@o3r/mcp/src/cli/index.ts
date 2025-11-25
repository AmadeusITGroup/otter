#!/usr/bin/env node
import {
  type LogLevel,
  MCPLogger,
} from '@ama-mcp/core';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  createMcpServer,
} from '../mcp-server';

async function startMcpServer() {
  const logger = new MCPLogger('O3R MCP server', process.env.O3R_MCP_LOG_LEVEL as LogLevel);
  const server = await createMcpServer(logger);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Server connected...');
}

void startMcpServer();
