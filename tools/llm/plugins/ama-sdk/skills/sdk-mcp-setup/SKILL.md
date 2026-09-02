---
name: sdk-mcp-setup
description: Install and configure the @ama-sdk/mcp server so AI assistants can read SDK_CONTEXT.md from installed SDK packages. Use when the get_sdk_context tool is unavailable, or the user asks to "set up the ama-sdk mcp" or "configure sdk context server".
---

# ama-sdk MCP Server Setup

Configure the [`@ama-sdk/mcp`](https://github.com/AmadeusITGroup/otter/tree/main/mcps/@ama-sdk/mcp) server so AI assistants can read the `SDK_CONTEXT.md` of installed SDK packages and use real operation IDs, models, and domains instead of hallucinating.

## Prerequisites

- One or more SDKs generated with `@ama-sdk/schematics`, each exposing an `SDK_CONTEXT.md`.
- The server needs the **package names** of the SDKs to expose (e.g. `@my-scope/my-sdk`).

How you get the `SDK_CONTEXT.md` depends on where the SDK lives:

- **SDK source available (monorepo or local project)** — generate the context from the SDK project:

  ```bash
  npx amasdk-update-sdk-context --interactive
  ```

- **SDK consumed from `node_modules`** — you can't regenerate it; the context must already ship inside the published package. Point `@ama-sdk/mcp` at the package name and it reads the bundled `SDK_CONTEXT.md`. If the package doesn't ship one, ask the SDK maintainer to generate and publish it.

## Configuration

The server runs via `npx` with no permanent install.

### Step 1: Declare the SDK packages in package.json

List the SDKs to expose under `sdkContext.packages` in the project's `package.json`. Prefer this over passing `--packages` on the command line — the list lives in one place, so the Claude Code and Copilot configs below stay identical with nothing to duplicate:

```json
{
  "sdkContext": {
    "packages": ["@my-scope/my-sdk", "@other-scope/other-sdk"]
  }
}
```

### Step 2: Register the server

The server reads `sdkContext.packages` automatically, so both clients use the same args.

**Claude Code** — add to `.mcp.json` at the project root:

```json
{
  "mcpServers": {
    "sdk-context": {
      "command": "npx",
      "args": ["-y", "-p", "@ama-sdk/mcp", "ama-sdk-mcp"]
    }
  }
}
```

**GitHub Copilot (VS Code)** — add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "sdk-context": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "-p", "@ama-sdk/mcp", "ama-sdk-mcp"]
    }
  }
}
```

### Alternative: pass packages on the command line

If you can't edit `package.json`, list the SDKs after `--packages` instead (append to the `args` array): `["-y", "-p", "@ama-sdk/mcp", "ama-sdk-mcp", "--packages", "@my-scope/my-sdk", "@other-scope/other-sdk"]`. This has to be repeated in each client's config.

## Metrics (optional)

Ask the user whether to enable anonymous usage metrics. If they agree, add an `env` block to the server config:

```json
"env": {
  "O3R_METRICS": true
}
```

Privacy policy: https://github.com/AmadeusITGroup/otter/blob/main/PRIVACY.md
