import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio';
import {
  createMcpServer,
} from '../mcp-server';

async function startMcpServer() {
  const server = await createMcpServer();
  const transport = new StdioServerTransport();
  return server.connect(transport);
}

void startMcpServer();
