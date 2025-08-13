<h1 align="center">Otter MCP</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

<br />
<br />

## Description

A small example of an MCP server.

## How to use with VSCode

To add the Otter MCP server, you should first activate mcp with `"chat.mcp.enabled": true`.

> [!WARNING]
> If you are logged into VSCode with your company account,
> this setting may be grayed out. This may be due to your company's setting.

Then, in your `.vscode/mcp.json` add

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
> If you want to test the MCP server locally while you are working on it,
> you need to build it first with the command:
> - `yarn nx build mcp`
