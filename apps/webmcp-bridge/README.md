# @o3r/webmcp-bridge

> **Local development tool** — This package is private and not published to npm.

WebSocket relay server that enables **local AI coding agents** (Claude, Kiro, Copilot, etc.) to interact with an Angular application's [WebMCP](https://webmachinelearning.github.io/webmcp/) tools at development time.

## Why is this needed?

The [WebMCP specification](https://webmachinelearning.github.io/webmcp/) defines how web applications expose tools via `document.modelContext`. In production, an AI agent will be embedded directly in the UI and will interact with these tools through the browser's native WebMCP API — no relay needed.

However, **during local development**, you may want to test your WebMCP tools with external AI coding agents (Claude, Kiro, Copilot, etc.) that communicate over [MCP](https://modelcontextprotocol.io/) using stdio. These agents cannot connect directly to a browser tab.

This relay server bridges that gap by acting as a **mock for the future in-app AI agent**, routing messages between:

- **Browser clients** — the Angular app running in a browser tab
- **MCP clients** — the `@ama-mcp/webmcp` MCP server that speaks stdio to AI agents

This allows you to develop and test your WebMCP tools today with real AI agents, before the in-app AI integration is available.

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     WebSocket      ┌─────────────────┐     stdio      ┌──────────┐
│  Angular App    │◄──────────────────►│  webmcp-bridge   │◄──────────────────►│  @ama-mcp/webmcp│◄─────────────►│ AI Agent │
│  (browser tab)  │  ?role=browser      │  (this server)   │  ?role=mcp          │  (MCP server)   │               │          │
└─────────────────┘                     └──────────────────┘                     └─────────────────┘               └──────────┘
  provideExperimentalWebMcpBridge()       ws://localhost:3200                      ama-mcp-webmcp
  from @o3r/core
```

The three pieces that work together:

| Package | Role | Published |
|---------|------|-----------|
| `provideExperimentalWebMcpBridge()` from `@o3r/core` | Angular provider — connects the browser to the relay | ✅ (part of `@o3r/core`) |
| `@o3r/webmcp-bridge` (this package) | WebSocket relay — routes messages between browser and MCP | ❌ (private, local only) |
| `@ama-mcp/webmcp` | MCP server (stdio) — exposes browser tools to AI agents | ❌ (private, local only) |

## Prerequisites

The WebMCP API (`document.modelContext`) is not yet enabled by default in Chrome. You must activate it before using this tool:

1. Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`
2. Set the flag to **Enabled**
3. Relaunch Chrome

> Alternatively, you can enroll in the [WebMCP Origin Trial](https://developer.chrome.com/docs/ai/webmcp) starting from Chrome 149.

## Usage

### 1. Start the relay server

```bash
yarn nx start webmcp-bridge
```

This starts a WebSocket server on `ws://localhost:3200` by default.

### 2. Add the provider to your Angular app

```typescript
import { provideExperimentalWebMcpBridge } from '@o3r/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalWebMcpBridge(),
    // ...
  ]
};
```

### 3. Configure your AI agent to use the MCP server

Add `@ama-mcp/webmcp` as an MCP server in your agent's configuration (e.g. `.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "webmcp": {
      "command": "node",
      "args": ["mcps/@ama-mcp/webmcp/dist/main.js"]
    }
  }
}
```

> **Note:** Build `@ama-mcp/webmcp` first with `yarn nx build ama-mcp-webmcp` so that `dist/main.js` exists.

### 4. Open your app in the browser

Once the app loads, the bridge provider connects to the relay and registers all `document.modelContext` tools. The AI agent can then discover and call those tools through the MCP protocol.

## Known limitations

- **One active browser tab at a time.** The relay routes `tools/call` messages to the most recently connected browser tab (the one that last sent `tools/register`). If multiple tabs are open with the app, only the most recently active tab receives tool calls. Close extra tabs to avoid confusion.

## Configuration

| Environment variable | Default | Description |
|---------------------|---------|-------------|
| `PORT` | `3200` | WebSocket server port |

## WebSocket protocol

Clients connect with a `?role=` query parameter:

- `?role=browser` — browser clients that register tools and handle tool calls
- `?role=mcp` — MCP clients that request tool lists and initiate tool calls

### Messages from browser → relay

| Type | Description |
|------|-------------|
| `tools/register` | Registers the current tool list (`{ type, tools[] }`) |
| `tools/call/response` | Returns a tool execution result (`{ type, id, result }`) |

### Messages from MCP client → relay

| Type | Description |
|------|-------------|
| `tools/list` | Requests the current tool list |
| `tools/call` | Initiates a tool call (`{ type, id, name, arguments }`) |
