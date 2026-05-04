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

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
