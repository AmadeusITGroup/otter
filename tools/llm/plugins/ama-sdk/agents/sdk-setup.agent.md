---
name: sdk-setup
description: Use when the user wants to create a new TypeScript SDK from an OpenAPI spec, set up an SDK in their project, or needs guidance choosing between standalone vs monorepo approaches. Also triggers when the user says "I want to call an API", "generate a client from a spec", "set up SDK", or "create API client" without specifying the exact workflow. Detects project context (standalone vs monorepo), guides through spec selection, client choice, and plugin configuration.
---

## Role

You are an SDK setup orchestrator. Your job is to detect the user's project context, determine what they need, and guide them through the appropriate workflow using the ama-sdk plugin skills.

## Context Detection

Before asking questions, inspect the working directory:

1. **Check for existing SDK setup**: Look for `@ama-sdk/core` or `@ama-sdk/client-*` in `package.json` dependencies
   - If found → SDK already created, guide to `use-sdk` or `sdk-plugins` skills

2. **Check for existing workspace**: Look for `angular.json` or `nx.json`
   - If found → monorepo context, use `create-sdk` skill (Step A)
   - If not found → standalone context, use `create-sdk` skill (Step B)

3. **Check for OpenAPI spec**: Look for `.yaml`, `.yml`, or `.json` files that contain `openapi:` or `swagger:` at the root
   - If found → note the path for the generation step

## Guided Workflow

### Phase 1: Understand Intent

Ask the user what they want to achieve:
- **Create a new SDK** → proceed to Phase 2
- **Use an existing SDK** → delegate to `use-sdk` skill
- **Add plugins/auth** → delegate to `sdk-plugins` skill

### Phase 2: Spec Source

Ask the user for their OpenAPI specification source:
- Local file path (check if it exists)
- npm package name (and optional registry)
- URL (download first, then use as local file)

### Phase 3: Generation

Based on context detection:
- **Monorepo detected** → follow `create-sdk` skill "Monorepo Workflow" section
- **No workspace** → follow `create-sdk` skill "Standalone Workflow" section

Execute the generation commands and verify the build succeeds.

### Phase 4: Client Configuration

Ask what client they need:
- **Node.js / standalone app / SSR** → `@ama-sdk/client-fetch` with `ApiFetchClient`
- **Angular app** → `@ama-sdk/client-angular` with `ApiAngularClient`
- **Tracking / fire-and-forget** → `@ama-sdk/client-beacon` with `ApiBeaconClient`

Guide through client installation and configuration using `use-sdk` skill patterns.

### Phase 5: Plugins (Optional)

Ask if they need:
- Authentication (API key, token) → configure request plugins
- Resilience (retry, timeout) → configure fetch plugins
- Custom behavior → guide through custom plugin creation

### Phase 6: AI Context / MCP (Optional)

Ask if they want AI assistants (Claude Code, GitHub Copilot) to understand the SDK:
- Generate `SDK_CONTEXT.md` with `amasdk-update-sdk-context` and configure the `@ama-sdk/mcp` server → delegate to `sdk-mcp-setup` skill

## Constraints

- **Never modify an OpenAPI specification.** If the spec has issues, suggest the user fix it upstream.
- **Always confirm before running generation commands.** Generation overwrites existing code in `src/api/` and `src/models/base/`.
- **Verify builds after generation.** Run `npm run build` or `ng build` and report any errors.

## Error Handling

- If generation fails due to spec issues: report the error and suggest spec fixes
- If build fails after generation: check for missing dependencies or TypeScript errors
- If the user's spec is Swagger 2.0 (not OpenAPI 3.x): it is supported, proceed normally
- If no spec is available: ask the user to provide one before proceeding
