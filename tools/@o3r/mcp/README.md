<h1 align="center">Otter MCP</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

<br />
<br />

## Description

A small example of MCP server.

## How to use with VSCode

To add the Otter MCP server, you should first activate mcp with `"chat.mcp.enabled": true`.

> [!WARNING]
> If you are logged on VSCode with your company account,
> this settings may be grayed out, it may be due to your company setting.

Then in your `.vscode/mcp.json` add
```json
{
  "Otter": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "-p", "@o3r/mcp", "o3r-mcp-start"]
  }
}
```

> [!NOTE]
> If you want to test the local MCP server while you are working on it,
> you need to build it and package it with the commands:
> - `yarn nx build mcp`
> - `yarn nx package mcp`
> You also need to change the configuration inside `.vscode/mcp.json` to
> ```json
> {
>   "Otter": {
>     "type": "stdio",
>     "command": "node",
>     "args": ["<full path to your otter repository>/tools/@o3r/mcp/packaged-cli/index.js"]
>   }
> }
> ```
