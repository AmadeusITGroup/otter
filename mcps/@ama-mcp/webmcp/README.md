# @ama-mcp/webmcp

> **Local development tool** — This package is private and not published to npm.

MCP server that exposes an Angular application's [WebMCP](https://webmachinelearning.github.io/webmcp/) tools to AI coding agents (Claude, Kiro, Copilot, etc.) via the standard [Model Context Protocol](https://modelcontextprotocol.io/).

## What it does

Angular applications can register tools on `document.modelContext` using the WebMCP browser API. In production, an AI agent embedded in the UI will call these tools directly through the browser's native WebMCP API.

**During local development**, this package acts as the bridge that lets external AI coding agents interact with those same tools. It connects to a WebSocket relay server, discovers the tools registered by the Angular app, and re-exposes them as standard MCP tools over stdio.

## Architecture

This package is the **MCP server** piece of a three-part local development setup:

```
┌─────────────────┐     WebSocket      ┌──────────────────┐     WebSocket      ┌─────────────────┐     stdio      ┌──────────┐
│  Angular App    │◄──────────────────►│  webmcp-bridge   │◄──────────────────►│  @ama-mcp/webmcp│◄─────────────►│ AI Agent │
│  (browser tab)  │  ?role=browser      │  (relay server)  │  ?role=mcp          │  (this package) │               │          │
└─────────────────┘                     └──────────────────┘                     └─────────────────┘               └──────────┘
  provideExperimentalWebMcpBridge()       @o3r/webmcp-bridge                      ama-mcp-webmcp
  from @o3r/core                          (apps/webmcp-bridge)
```

| Package | Role |
|---------|------|
| `provideExperimentalWebMcpBridge()` from `@o3r/core` | Angular provider — connects the browser to the relay |
| `@o3r/webmcp-bridge` (`apps/webmcp-bridge`) | WebSocket relay — routes messages between browser and MCP |
| **`@ama-mcp/webmcp`** (this package) | MCP server (stdio) — exposes browser tools to AI agents |

## Quick start

### Prerequisites

1. **Enable WebMCP in Chrome** — the WebMCP API (`document.modelContext`) is not yet enabled by default:
   1. Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`
   2. Set the flag to **Enabled**
   3. Relaunch Chrome

   > Alternatively, you can enroll in the [WebMCP Origin Trial](https://developer.chrome.com/docs/ai/webmcp) starting from Chrome 149.

2. The Angular app must include `provideExperimentalWebMcpBridge()` in its providers
3. The relay server (`@o3r/webmcp-bridge`) must be running on `localhost:3200`
4. This package must be built: `yarn nx build ama-mcp-webmcp`

### Configure your AI agent

Add this package as an MCP server in your agent's configuration.

For **Kiro** (`.kiro/settings/mcp.json`):

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

For **Claude Code** (`.mcp.json`):

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

### Run the full stack

```bash
# 1. Build the MCP server
yarn nx build ama-mcp-webmcp

# 2. Start the relay server
yarn nx start webmcp-bridge

# 3. Start the Angular app
yarn nx serve showcase

# 4. Open the app in your browser, then use your AI agent
#    The agent will automatically discover tools registered by the app
```

## Configuration

| Environment variable | Default | Description |
|---------------------|---------|-------------|
| `WEBMCP_BRIDGE_URL` | `ws://localhost:3200?role=mcp` | WebSocket URL of the relay server |

## How it works

1. On startup, this server connects to the relay as an MCP client (`?role=mcp`)
2. It requests the current tool list from the relay
3. When the browser registers or unregisters tools, the relay pushes updates
4. The server emits `notifications/tools/list_changed` so the AI agent refreshes its tool list
5. When the AI agent calls a tool, this server forwards the request through the relay to the browser
6. The browser executes the tool in the Angular injection context and returns the result
7. Tool calls time out after 120 seconds

## Development

```bash
# Build
yarn nx build ama-mcp-webmcp

# The built binary is at dist/main.js
```
