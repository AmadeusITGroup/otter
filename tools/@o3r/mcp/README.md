<h1 align="center">Otter MCP</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

<br />
<br />

> [!WARNING]
> [Experimental](https://github.com/AmadeusITGroup/otter/blob/main/README.md#experimental)

## Description

A small example of an MCP server.

## How to use with VSCode

To add the Otter MCP server, you should first activate mcp with `"chat.mcp.enabled": true`.

> [!WARNING]
> If you are logged into VSCode with your company account,
> this setting may be grayed out. This may be due to your company's setting.

Then, in your `.vscode/mcp.json` add

```json5
{
  "Otter": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "-p", "@o3r/mcp", "o3r-mcp-start"],
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
> - `yarn nx build mcp`
