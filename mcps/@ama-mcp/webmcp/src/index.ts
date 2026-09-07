import {
  AmaMcpServer,
  type LogLevel,
  MCPLogger,
} from '@ama-mcp/core';
import type {
  RegisteredTool,
} from '@modelcontextprotocol/server';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/server/stdio';
import WebSocket from 'ws';

const BRIDGE_URL = process.env.WEBMCP_BRIDGE_URL || 'ws://localhost:3200?role=mcp';
const RECONNECT_INTERVAL = 3000;
const TOOL_CALL_TIMEOUT = 120_000;

interface RelayTool {
  name: string;
  description: string;
  inputSchema: object;
}

interface RelayMessage {
  type: string;
  tools?: RelayTool[];
  id?: string;
  name?: string;
  arguments?: Record<string, unknown>;
  result?: object;
}

const logger = new MCPLogger('@ama-mcp/webmcp', (process.env.WEBMCP_LOG_LEVEL as LogLevel) || 'info');

const server = new AmaMcpServer(
  logger,
  { name: '@ama-mcp/webmcp', version: '0.0.0' }
);

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const pendingCalls = new Map<string, { resolve: (value: object) => void; reject: (reason: Error) => void }>();
const registeredTools = new Map<string, RegisteredTool>();

/**
 * Sends a JSON message to the relay server.
 * @param message - The message payload to send
 */
function sendToRelay(message: RelayMessage): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

/**
 * Calls a tool on the browser via the relay and returns the result.
 * @param name - Tool name to invoke
 * @param args - Tool arguments
 */
async function callBrowserTool(name: string, args: Record<string, unknown>): Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }> {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return {
      content: [{ type: 'text', text: 'Error: WebSocket not connected to relay server' }],
      isError: true
    };
  }

  const id = crypto.randomUUID();

  const resultPromise = new Promise<object>((resolve, reject) => {
    pendingCalls.set(id, { resolve, reject });
    setTimeout(() => {
      if (pendingCalls.has(id)) {
        pendingCalls.delete(id);
        reject(new Error('Tool call timed out'));
      }
    }, TOOL_CALL_TIMEOUT);
  });

  sendToRelay({ type: 'tools/call', id, name, arguments: args });

  try {
    const result = await resultPromise;
    return result as { content: { type: 'text'; text: string }[]; isError?: boolean };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
}

/**
 * Synchronizes the MCP server's registered tools with the tools reported by the browser.
 * Removes tools that are no longer present and registers new ones.
 * @param tools - The current list of tools from the browser
 */
function syncTools(tools: RelayTool[]): void {
  const incomingNames = new Set(tools.map((t) => t.name));

  // Remove tools that are no longer present
  for (const [name, registered] of registeredTools) {
    if (!incomingNames.has(name)) {
      registered.remove();
      registeredTools.delete(name);
      logger.debug(`Tool removed: ${name}`);
    }
  }

  // Register new tools and update existing ones
  for (const tool of tools) {
    if (registeredTools.has(tool.name)) {
      continue;
    }

    const registered = server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema as Record<string, unknown>
      },
      async ({ args }) => {
        return callBrowserTool(tool.name, (args ?? {}) as Record<string, unknown>);
      }
    );
    registeredTools.set(tool.name, registered);
    logger.debug(`Tool registered: ${tool.name}`);
  }

  logger.info(`Tools synced: ${tools.map((t) => t.name).join(', ') || '(none)'}`);
}

/**
 * Handles incoming messages from the relay server.
 * @param data - Raw message data from WebSocket
 */
function handleRelayMessage(data: WebSocket.Data): void {
  let message: RelayMessage;
  let raw: string;
  if (typeof data === 'string') {
    raw = data;
  } else if (Buffer.isBuffer(data)) {
    raw = data.toString('utf8');
  } else if (data instanceof ArrayBuffer) {
    raw = Buffer.from(data).toString('utf8');
  } else {
    raw = Buffer.concat(data).toString('utf8');
  }
  try {
    message = JSON.parse(raw);
  } catch {
    logger.error('Failed to parse relay message');
    return;
  }

  switch (message.type) {
    case 'tools/list/response':
    case 'tools/updated': {
      syncTools(message.tools || []);
      break;
    }

    case 'tools/call/response': {
      if (message.id && pendingCalls.has(message.id)) {
        const pending = pendingCalls.get(message.id)!;
        pendingCalls.delete(message.id);
        pending.resolve(message.result || { content: [{ type: 'text', text: 'No result returned' }] });
      }
      break;
    }

    default: {
      logger.warn(`Unknown relay message type: ${message.type}`);
    }
  }
}

/**
 * Establishes a WebSocket connection to the relay server with auto-reconnect.
 */
function connectWebSocket(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  ws = new WebSocket(BRIDGE_URL);

  ws.on('open', () => {
    logger.info(`Connected to relay at ${BRIDGE_URL}`);
    sendToRelay({ type: 'tools/list' });
  });

  ws.on('message', handleRelayMessage);

  ws.on('close', () => {
    logger.info(`Disconnected from relay. Reconnecting in ${String(RECONNECT_INTERVAL / 1000)}s...`);
    ws = null;
    scheduleReconnect();
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket error: ${error.message}`);
  });
}

/**
 * Schedules a reconnection attempt after the configured interval.
 */
function scheduleReconnect(): void {
  if (reconnectTimer) {
    return;
  }
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, RECONNECT_INTERVAL);
}

async function main(): Promise<void> {
  connectWebSocket();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('MCP server started on stdio');
}

main().catch((error) => {
  logger.error(`Fatal error: ${String(error)}`);
  process.exit(1);
});
