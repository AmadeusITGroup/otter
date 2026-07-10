# ama-sdk

AI-powered skills for creating, using, and extending TypeScript SDKs generated from OpenAPI specifications with the @ama-sdk toolchain.

## Skills

| Skill | Description |
|-------|-------------|
| **create-sdk** | Create a TypeScript SDK from an OpenAPI spec (standalone or monorepo) |
| **use-sdk** | Install, configure clients (Fetch/Angular/Beacon), and call APIs |
| **sdk-plugins** | Use built-in plugins and create custom ones for auth, retry, etc. |
| **sdk-mcp-setup** | Configure the `@ama-sdk/mcp` server so AI assistants read `SDK_CONTEXT.md` |

## Agents

| Agent | Description |
|-------|-------------|
| **sdk-setup** | Detects project context and guides through the full SDK setup workflow |

## Installation

**Claude Code** (CLI or VS Code extension):

```
/plugin marketplace add AmadeusITGroup/otter
/plugin install ama-sdk
```

**GitHub Copilot in VS Code** — either:

- Run **Chat: Install Plugin From Source** from the Command Palette and enter this repository's URL, or
- Add the marketplace to your user `settings.json` so plugins stay discoverable:

  ```json
  "chat.plugins.marketplaces": {
    "AmadeusITGroup/otter": true
  }
  ```

The same [`.claude-plugin/`](../../../../.claude-plugin/marketplace.json) manifest is recognized by both tools — see VS Code's [agent plugins documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) for the format-detection rules.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- An OpenAPI 3.x or Swagger 2.0 specification

## Usage Examples

**"Create an SDK from my spec"** → triggers `sdk-setup` agent or `create-sdk` skill

**"Add retry and auth to my API client"** → triggers `sdk-plugins` skill

**"How do I call the search endpoint from my SDK?"** → triggers `use-sdk` skill

**"I have a monorepo, add an SDK library"** → triggers `create-sdk` skill

**"Set up the ama-sdk MCP so Copilot/Claude knows my SDK"** → triggers `sdk-mcp-setup` skill

## Related Packages

- [`@ama-sdk/core`](https://www.npmjs.com/package/@ama-sdk/core) — SDK framework and plugin system
- [`@ama-sdk/client-fetch`](https://www.npmjs.com/package/@ama-sdk/client-fetch) — Fetch API client
- [`@ama-sdk/client-angular`](https://www.npmjs.com/package/@ama-sdk/client-angular) — Angular HttpClient
- [`@ama-sdk/client-beacon`](https://www.npmjs.com/package/@ama-sdk/client-beacon) — Beacon API client
- [`@ama-sdk/schematics`](https://www.npmjs.com/package/@ama-sdk/schematics) — Code generators
- [`@ama-sdk/create`](https://www.npmjs.com/package/@ama-sdk/create) — Project initializer

## Contributing

To add a new skill:
1. Create a `.md` file in `skills/` (or a subdirectory with `SKILL.md`)
2. Add YAML frontmatter with `name` and `description` fields
3. Follow existing skill structure (Usage, Process, Example sections)
