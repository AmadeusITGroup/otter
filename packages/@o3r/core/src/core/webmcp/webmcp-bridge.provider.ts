/* eslint-disable no-console -- this is an experimental dev-only bridge; console output is intentional for visibility in the browser DevTools */
import {
  DestroyRef,
  EnvironmentProviders,
  inject,
  NgZone,
  provideEnvironmentInitializer,
} from '@angular/core';

/**
 * Options for {@link provideExperimentalWebMcpBridge}.
 */
export interface WebMcpBridgeOptions {
  /**
   * WebSocket URL of the relay server.
   * @default 'ws://localhost:3200?role=browser'
   */
  url?: string;
  /**
   * Interval in milliseconds between reconnection attempts when the WebSocket
   * connection is lost.
   * @default 3000
   */
  reconnectInterval?: number;
}

/** Tool info type returned by `document.modelContext.getTools()`, declared by `@mcp-b/webmcp-types`. */
type ModelContextToolInfo = Awaited<ReturnType<Document['modelContext']['getTools']>>[number];

/**
 * Provides the WebMCP bridge for **local development and testing with AI coding agents**.
 *
 * This provider connects the Angular application's {@link https://webmachinelearning.github.io/webmcp/ | WebMCP} tools
 * (registered via `document.modelContext`) to a WebSocket relay server. It is designed to work together with:
 *
 * - **`@o3r/webmcp-bridge`** — a local WebSocket relay server (`apps/webmcp-bridge`) that routes
 *   messages between the browser and MCP clients. Start it with `yarn nx start webmcp-bridge`.
 * - **`@ama-mcp/webmcp`** — an MCP server (stdio transport) that connects to the relay and exposes
 *   the browser tools to AI agents (Claude, Kiro, Copilot, etc.) via the standard MCP protocol.
 *
 * The full data flow is:
 * ```
 * Angular App (browser) ↔ WebSocket Relay ↔ MCP Server (stdio) ↔ AI Agent
 * ```
 *
 * The relay server is needed because browsers cannot speak stdio MCP directly. In production,
 * the AI agent will be integrated directly into the UI via the WebMCP browser API, making the
 * relay unnecessary. This provider is only needed during development to test with external
 * AI agents (Claude, Kiro, etc.) that communicate over MCP stdio.
 * @note
 * The WebMCP API (`document.modelContext`) must be enabled in Chrome before using this provider.
 * Navigate to `chrome://flags/#enable-webmcp-testing`, set the flag to **Enabled**, and relaunch Chrome.
 * Alternatively, enroll in the {@link https://developer.chrome.com/docs/ai/webmcp | WebMCP Origin Trial} starting from Chrome 149.
 * @note
 * This provider should only be included in development builds. It has no effect if the relay
 * server is not running — the connection will silently retry at the configured interval.
 * @note
 * **Only one browser tab should have the app open at a time.** The relay routes `tools/call`
 * requests to the most recently registered browser tab only. If multiple tabs are open, only the
 * last tab to call `tools/register` will receive tool calls.
 * @experimental
 * @param options - Optional configuration for the bridge
 */
export function provideExperimentalWebMcpBridge(options?: WebMcpBridgeOptions): EnvironmentProviders {
  const wsUrl = options?.url ?? 'ws://localhost:3200?role=browser';
  const reconnectMs = options?.reconnectInterval ?? 3000;

  return provideEnvironmentInitializer(() => {
    const ngZone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    if (!('modelContext' in document)) {
      console.warn('[WebMCP Bridge] document.modelContext is not available. Enable the WebMCP API in Chrome (chrome://flags/#enable-webmcp-testing) or enroll in the Origin Trial.');
      return;
    }

    const modelContext = document.modelContext;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;
    // Cached tool references from the last getTools() call, kept in sync via toolchange events.
    // Used to look up the tool object for executeTool() without an extra async getTools() round-trip on each call.
    let cachedTools: ModelContextToolInfo[] = [];

    destroyRef.onDestroy(() => {
      destroyed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws) {
        ws.close();
      }
    });

    const refreshAndRegisterTools = async (socket: WebSocket) => {
      const tools = await modelContext.getTools();
      cachedTools = tools;
      const serializedTools = tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: typeof tool.inputSchema === 'string' ? JSON.parse(tool.inputSchema) as Record<string, unknown> : tool.inputSchema
      }));
      console.log(`[WebMCP Bridge] Sending ${String(serializedTools.length)} tools to relay:`, serializedTools.map((t) => t.name));
      socket.send(JSON.stringify({ type: 'tools/register', tools: serializedTools }));
    };

    const connect = () => {
      if (destroyed) {
        return;
      }

      ws = new WebSocket(wsUrl);

      ws.addEventListener('open', () => {
        console.log('[WebMCP Bridge] Connected to relay');
        void refreshAndRegisterTools(ws!);
      });

      ws.addEventListener('message', (event: MessageEvent) => {
        let message: { type: string; id: string; name: string; arguments: Record<string, unknown> };
        try {
          message = JSON.parse(event.data as string) as typeof message;
        } catch {
          return;
        }

        if (message.type === 'tools/call') {
          const tool = cachedTools.find((t) => t.name === message.name);
          if (!tool) {
            ws?.send(JSON.stringify({
              type: 'tools/call/response',
              id: message.id,
              result: { content: [{ type: 'text', text: `Tool "${message.name}" not found` }], isError: true }
            }));
            return;
          }
          void modelContext.executeTool(tool, JSON.stringify(message.arguments ?? {})).then(
            (result) => {
              ws?.send(JSON.stringify({
                type: 'tools/call/response',
                id: message.id,
                result: { content: [{ type: 'text', text: result ?? 'null' }] }
              }));
            },
            (error: unknown) => {
              ws?.send(JSON.stringify({
                type: 'tools/call/response',
                id: message.id,
                result: { content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }], isError: true }
              }));
            }
          );
        }
      });

      ws.addEventListener('close', () => {
        if (!destroyed) {
          reconnectTimer = setTimeout(() => connect(), reconnectMs);
        }
      });

      ws.addEventListener('error', () => {
        ws?.close();
      });
    };

    ngZone.runOutsideAngular(() => {
      // Listen to toolchange events and re-register tools with the relay
      const onToolChange = () => {
        if (ws?.readyState === WebSocket.OPEN) {
          void refreshAndRegisterTools(ws);
        }
      };

      modelContext.addEventListener('toolchange', onToolChange);
      destroyRef.onDestroy(() => {
        modelContext.removeEventListener('toolchange', onToolChange);
      });

      connect();
    });
  });
}
