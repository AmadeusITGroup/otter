import {
  Client,
} from '@modelcontextprotocol/client';
import type {
  JSONRPCMessage,
  McpServer,
  MessageExtraInfo,
  Transport,
  TransportSendOptions,
} from '@modelcontextprotocol/server';

// TODO: Replace with official InMemoryTransport once @modelcontextprotocol/core is published
class InMemoryTransport implements Transport {
  private otherTransport?: InMemoryTransport;
  private readonly messageQueue: { message: JSONRPCMessage; extra?: MessageExtraInfo }[] = [];

  public onclose?: () => void;
  public onmessage?: <T extends JSONRPCMessage>(message: T, extra?: MessageExtraInfo) => void;

  public static createLinkedPair(): [InMemoryTransport, InMemoryTransport] {
    const clientTransport = new InMemoryTransport();
    const serverTransport = new InMemoryTransport();
    clientTransport.otherTransport = serverTransport;
    serverTransport.otherTransport = clientTransport;
    return [clientTransport, serverTransport];
  }

  public start(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift()!;
      this.onmessage?.(queuedMessage.message, queuedMessage.extra);
    }
    return Promise.resolve();
  }

  public async close(): Promise<void> {
    const other = this.otherTransport;
    this.otherTransport = undefined;
    await other?.close();
    this.onclose?.();
  }

  public send(message: JSONRPCMessage, options?: TransportSendOptions): Promise<void> {
    if (!this.otherTransport) {
      throw new Error('Not connected');
    }
    if (this.otherTransport.onmessage) {
      this.otherTransport.onmessage(message, options as MessageExtraInfo | undefined);
    } else {
      this.otherTransport.messageQueue.push({ message, extra: options as MessageExtraInfo | undefined });
    }
    return Promise.resolve();
  }
}

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
    mcpServer.server.connect(serverTransport)
  ]);
  return { mcpServer, client };
};
