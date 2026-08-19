# SDK Context Usage Instructions

When implementing features that use installed SDKs, use the `get_sdk_context` tool as your primary source of truth. The SDK context provides a structured methodology for understanding available operations, models, and their organization.

> **Note**: The SDKs available through this MCP server are those explicitly configured in the server launch parameters (via `--packages` arguments or `sdkContext.packages` in `package.json`). Only these SDKs will have context available through the `get_sdk_context` tool.

## Core Principle

**Let the SDK context guide your implementation.** The context document describes the SDK's structure, available operations, and models. Base your responses on what you discover in the context rather than making assumptions.

## Using the SDK Context

1. **Query available SDK contexts** using `get_sdk_context` without arguments to discover configured SDKs
2. **Retrieve the relevant SDK context** by calling `get_sdk_context` with the package name
3. **Study the context's structure and methodology** - each SDK context describes how its operations and models are organized
4. **Follow the patterns provided** - use the exact operation IDs, model imports, and domain organization as documented in the context

## Fallback Discovery

If the SDK context is unavailable or incomplete for a specific operation:

- Search for OpenAPI/Swagger specification files (e.g., `openapi.yaml`, `swagger.json`, `spec.yaml`) in the project
- Browse the SDK's source files to discover available API classes and methods
- Check the SDK's `package.json` for entry points or documentation references

## Key Principles

- **Ground your responses in the context** - only use operations, models, and paths that exist in the SDK context or specification
- **Respect the SDK's organization** - follow the domain structure and naming conventions provided
- **Avoid assumptions** - if something is not documented in the context, verify its existence before using it

## Troubleshooting

### No SDK contexts found

Ensure the SDK packages are:
1. Listed in `package.json` under `sdkContext.packages`
2. Or provided via CLI arguments: `--packages @scope/sdk-name`
3. Installed in node_modules
4. Have `SDK_CONTEXT.md` generated (use `amasdk-update-sdk-context` in the SDK project)
