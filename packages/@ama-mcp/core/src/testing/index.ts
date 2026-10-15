import {
  Client,
} from '@modelcontextprotocol/client';
import {
  InMemoryTransport,
} from '@modelcontextprotocol/server';
import type {
  McpServer,
} from '@modelcontextprotocol/server';

/**
 * Set up an MCP client and server for testing purposes.
 * DO NOT USE OUTSIDE OF TESTS.
 * @param mcpServer
 * @experimental
 */
export const setUpClientAndServerForTesting = async (mcpServer: McpServer) => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  });
  await Promise.all([
    client.connect(clientTransport),
    mcpServer.connect(serverTransport)
  ]);
  return { mcpServer, client };
};
