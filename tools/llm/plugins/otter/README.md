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

## Skills

| Skill | Description |
|-------|-------------|
| **logic-placement** | Design mode: where new logic belongs. Routes the three decisions, owns the stop-and-ask rules and the recommendation format |
| **logic-review** | Review mode: misplaced logic in existing code — presenter leaks, `componentType` mismatches, wrong store variants, anti-patterns |
| **logic-component-shape** | Decision tree: single component vs container/presenter, `componentStructure`, `componentType` |
| **logic-state-layer** | Decision tree: component class vs service vs store, service scope, where API and SDK calls go |
| **logic-store-type** | Decision tree: which NgRx store variant — entity or simple, sync or async |
| **rxjs-vs-signals** | Choosing between Angular Signals and RxJS Observables, with bridging rules for `toSignal()` and `toObservable()` |
| **otter-schematics** | Ensures Otter schematics are used over manual file creation when scaffolding Angular artifacts |
| **otter-new-config** | Adding a configuration flag to a component: scope decisions, safe defaults, absence detection |
| **otter-rules-engine** | Authoring and debugging facts, operators, actions, and rulesets in `@o3r/rules-engine` |
| **playwright-e2e-testing** | Writing and reviewing Playwright E2E scenarios, actions, and checks |
| **otter-mcp-setup** | Installing and configuring the `@o3r/mcp` MCP server when it is unavailable |

The three `logic-*` decision trees are shared knowledge, read by both **logic-placement** and **logic-review** so that a design recommendation and a review verdict can never disagree. They are invoked by those two entry skills rather than by a question asked directly.

## Agents

This plugin ships specialized subagents in a format that both **Claude Code** (CLI and VS Code extension) and **GitHub Copilot in VS Code** auto-load when the plugin is installed.

| Agent | Description |
|-------|-------------|
| **otter-migration** | Safely upgrades `@o3r/*`, `@ama-mfe/*`, and `@ama-sdk/*` packages across an Otter monorepo, handling Angular peer-dependency bumps when required. Plans the migration, bumps versions, resolves peer-dependency conflicts, reads migration schematics and applies the equivalent changes manually, then validates the result. |
| **logic-design** | Decides where new application logic belongs — component shape, logic layer, store variant — and returns a recommendation with the schematic to run and what to verify. Stops to ask when the choice is a trade-off the user owns. |
| **logic-review** | Reviews existing components, services, and stores for misplaced logic and reports findings with `file:line`, the rule broken, and the concrete fix. Reads the same decision trees as **logic-design**, so the two cannot disagree. |

Invoke an agent by mentioning it (e.g. "use the otter-migration agent to upgrade to latest") or via the agent picker in Claude Code or GitHub Copilot.

### Installing the plugin

**Claude Code** (CLI or VS Code extension):

```
/plugin marketplace add AmadeusITGroup/otter
/plugin install otter
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
