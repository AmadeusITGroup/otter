# Otter AI Plugin

An AI plugin that provides MCP (Model Context Protocol) servers tailored for working with [Otter framework](https://github.com/AmadeusITGroup/otter) projects and Angular applications.

## MCP Servers

This plugin bundles three MCP servers:

| Server | Package | Description |
|--------|---------|-------------|
| **otter** | [`@o3r/mcp`](https://www.npmjs.com/package/@o3r/mcp) | Otter framework tooling: best practices, monorepo scaffolding, version migration, Angular schematics, GitHub release notes, and component metadata extraction |
| **angular** | [`@angular/cli`](https://www.npmjs.com/package/@angular/cli) | Angular CLI MCP server for discovering projects, running schematics, and querying documentation |
| **playwright** | [`@playwright/mcp`](https://www.npmjs.com/package/@playwright/mcp) | Playwright MCP server for browser automation, screenshot capture, and end-to-end testing |

All servers are launched via `npx` and require no additional local installation.

## Agents

This plugin ships specialized subagents in a format that both **Claude Code** (CLI and VS Code extension) and **GitHub Copilot in VS Code** auto-load when the plugin is installed.

| Agent | Description |
|-------|-------------|
| **otter-migration** | Safely upgrades `@o3r/*`, `@ama-mfe/*`, and `@ama-sdk/*` packages across an Otter monorepo, handling Angular peer-dependency bumps when required. Plans the migration, bumps versions, resolves peer-dependency conflicts, reads migration schematics and applies the equivalent changes manually, then validates the result. |

Invoke an agent by mentioning it (e.g. "use the otter-migration agent to upgrade to latest") or via the agent picker in Claude Code or GitHub Copilot.

### Installing the plugin

**Claude Code** (CLI or VS Code extension):

```
/plugin marketplace add AmadeusITGroup/otter
/plugin install otter
```

**GitHub Copilot in VS Code** — either:

- Run **Chat: Install Plugin From Source** from the Command Palette and enter this repository's URL, or
- Add the marketplace to your `settings.json` so plugins stay discoverable:

  ```json
  "chat.plugins.marketplaces": {
    "AmadeusITGroup/otter": true
  }
  ```

The same [`.claude-plugin/`](../../../../.claude-plugin/marketplace.json) manifest is recognized by both tools — see VS Code's [agent plugins documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) for the format-detection rules.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
