#!/usr/bin/env node
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio';
import {
  createMcpServer,
} from '../mcp-server';

async function startMcpServer() {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logging as error as recommended by modelcontextprotocol.io (https://modelcontextprotocol.io/quickstart/server#quick-examples-2)
  console.error('Server connected...');
}

void startMcpServer();
