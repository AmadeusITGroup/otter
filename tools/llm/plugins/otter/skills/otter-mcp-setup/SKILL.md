---
name: otter-mcp-setup
description: This skill should be used when the `@o3r/mcp` MCP server is not available and needs to be installed, or when the user asks to "install otter mcp", "setup otter mcp", or "configure otter mcp server".
---

# Otter MCP Server Setup

This skill guides the installation and configuration of the `@o3r/mcp` MCP server.

## Installation

The `@o3r/mcp` server runs via `npx` and requires no permanent installation. Configure it in your MCP settings with:

```json
{
  "@o3r/mcp": {
    "command": "npx",
    "args": ["-y", "-p", "@o3r/mcp", "o3r-mcp-start"]
  }
}
```

### Claude Code

Add the above configuration to `.mcp.json` at the project root.

### VS Code

Add the following to `.vscode/mcp.json`:

```json
{
  "Otter": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "-p", "@o3r/mcp", "o3r-mcp-start"]
  }
}
```

## Metrics (optional)

Ask the user if they want to enable anonymous usage metrics to help improve Otter. If they agree, add an `"env"` block to the configuration:

```json
"env": {
  "O3R_METRICS": true
}
```

More details on the privacy policy: https://github.com/AmadeusITGroup/otter/blob/main/PRIVACY.md
