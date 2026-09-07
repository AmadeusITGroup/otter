import type {
  IncomingMessage,
} from 'node:http';
import {
  WebSocket,
  WebSocketServer,
} from 'ws';

const PORT = Number.parseInt(process.env.PORT || '3200', 10);

interface Tool {
  name: string;
  description?: string;
  inputSchema?: object;
}

// In-memory state
let currentTools: Tool[] = [];
// The most recently registered browser tab is the one that handles tool calls.
// Only one tab should be active at a time — see the "Known limitations" section of the README.
let activeBrowserClient: WebSocket | null = null;
const browserClients = new Set<WebSocket>();
const mcpClients = new Set<WebSocket>();

const wss = new WebSocketServer({ port: PORT });

function log(msg: string): void {
  console.error(`[webmcp-bridge] ${msg}`);
}

function send(ws: WebSocket, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcast(clients: Set<WebSocket>, data: unknown): void {
  for (const client of clients) {
    send(client, data);
  }
}

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const role = url.searchParams.get('role'); // 'browser' or 'mcp'

  if (role === 'browser') {
    browserClients.add(ws);
    log(`Browser client connected (total: ${browserClients.size})`);
    if (browserClients.size > 1) {
      log('Warning: multiple browser tabs connected. Only the tab that last sent tools/register will receive tool calls.');
    }

    ws.on('close', () => {
      browserClients.delete(ws);
      if (activeBrowserClient === ws) {
        activeBrowserClient = null;
      }
      log(`Browser client disconnected (total: ${browserClients.size})`);
    });

    ws.on('message', (raw: Buffer) => {
      let msg: { type: string; tools?: Tool[]; id?: string; result?: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        case 'tools/register': {
          currentTools = msg.tools ?? [];
          activeBrowserClient = ws;
          log(`Tools registered: ${currentTools.map((t: Tool) => t.name).join(', ')}`);
          // Notify all MCP clients of the update
          broadcast(mcpClients, { type: 'tools/updated', tools: currentTools });
          break;
        }
        case 'tools/call/response': {
          // Forward tool call result to all MCP clients
          broadcast(mcpClients, {
            type: 'tools/call/response',
            id: msg.id,
            result: msg.result
          });
          break;
        }
      }
    });
  } else if (role === 'mcp') {
    mcpClients.add(ws);
    log(`MCP client connected (total: ${mcpClients.size})`);

    ws.on('close', () => {
      mcpClients.delete(ws);
      log(`MCP client disconnected (total: ${mcpClients.size})`);
    });

    ws.on('message', (raw: Buffer) => {
      let msg: { type: string; id?: string; name?: string; arguments?: unknown };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (msg.type) {
        case 'tools/list': {
          send(ws, { type: 'tools/list/response', tools: currentTools });
          break;
        }
        case 'tools/call': {
          if (!activeBrowserClient || activeBrowserClient.readyState !== WebSocket.OPEN) {
            send(ws, {
              type: 'tools/call/response',
              id: msg.id,
              result: { content: [{ type: 'text', text: 'Error: no browser tab is connected' }], isError: true }
            });
            break;
          }
          // Forward tool call to the active browser tab only
          send(activeBrowserClient, {
            type: 'tools/call',
            id: msg.id,
            name: msg.name,
            arguments: msg.arguments
          });
          break;
        }
      }
    });
  } else {
    log(`Client connected without valid role param (got: ${role}), closing.`);
    ws.close(4000, 'Missing or invalid ?role= query parameter. Use ?role=browser or ?role=mcp');
    return;
  }

  ws.on('error', (err: Error) => {
    log(`WebSocket error: ${err.message}`);
  });
});

log(`WebSocket relay server listening on ws://localhost:${PORT}`);
log(`  Browser clients: ws://localhost:${PORT}?role=browser`);
log(`  MCP clients:     ws://localhost:${PORT}?role=mcp`);
