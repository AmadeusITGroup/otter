<h1 align="center">Amadeus OpenAPI MCP Server</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

<br />
<br />

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental): This package is available in early access, the final version will be released in v15.

[![Stable Version](https://img.shields.io/npm/v/@ama-openapi/mcp?style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/mcp)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@ama-openapi/mcp?color=green&style=for-the-badge)](https://www.npmjs.com/package/@ama-openapi/mcp)

## Description

MCP server to expose OpenAPI specifications tools to AI assistants.

## How to use with VSCode

To add the Ama OpenAPI MCP server, you should first activate mcp with `"chat.mcp.enabled": true` and add the following configuration in your `.vscode/mcp.json` file:

```json5
{
  "Otter": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "-p", "@ama-openapi/mcp", "ama-openapi-mcp"],
    "env": {
      // Help us improve Otter by setting this to true.
      // More details on our privacy policy: https://github.com/AmadeusITGroup/otter/blob/main/PRIVACY.md
      "O3R_METRICS": true
    }
  }
}
```

> [!NOTE]
> If you want to test the MCP server locally while you are working on it,
> you need to build it first with the command:
>
> - `yarn nx build ama-openapi-mcp`
