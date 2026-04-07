# @ama-mcp/sdk

MCP module to expose `SDK_CONTEXT.md` from installed packages to AI assistants.

## Purpose

When SDKs are generated using [@ama-sdk/schematics](https://www.npmjs.com/package/@ama-sdk/schematics), they can include an `SDK_CONTEXT.md` file that describes:
- Available API domains and operations
- Models used by each domain
- Guidelines for AI tools to avoid hallucinations

This MCP module automatically discovers and loads these context files from installed packages using Node.js's module resolution, then exposes them to AI assistants.

## Configuration

### VS Code `.vscode/mcp.json`

Configure SDK packages directly in your `.vscode/mcp.json`:

```json
{
  "servers": {
    "sdk-context": {
      "command": "npx",
      "args": ["ama-mcp-sdk", "--packages", "@my-scope/my-sdk-package", "@other-scope/other-sdk"]
    }
  }
}
```

## Usage

### CLI (for mcp.json)

```bash
# Specify packages with --packages flag
ama-mcp-sdk --packages @my-scope/my-sdk @other-scope/other-sdk

# Show help
ama-mcp-sdk --help
```

### Programmatic (in custom MCP server)

```typescript
import { registerSdkContextToolAndResources } from '@ama-mcp/sdk';

// With explicit packages
await registerSdkContextToolAndResources(server, {
  sdkPackages: ['@my-scope/my-sdk']
});

// Or reads from package.json sdkContext.packages automatically
await registerSdkContextToolAndResources(server);
```

### Available Tool

**`get_sdk_context`** - Retrieve SDK context for configured packages

```
// List all configured SDKs with context
get_sdk_context()

// Get context for specific package
get_sdk_context({ packageName: "@my-scope/my-sdk-package" })
```

### Available Resources

**`sdk-context://instructions`** - Usage guidelines for AI assistants

This resource provides instructions on how to use SDK context effectively to avoid hallucinations when implementing features. AI assistants should read this resource before using the `get_sdk_context` tool.

**`sdk-context://<package-name>`** - SDK context for each configured package

Each configured SDK package that has an `SDK_CONTEXT.md` file is exposed as a resource.

## How It Works

1. Reads `sdkContext.packages` from project's `package.json` or uses CLI arguments
2. Uses Node.js `require.resolve()` to automatically locate packages
3. Loads `SDK_CONTEXT.md` from each resolved package
4. Registers each as an MCP resource
5. Provides a tool for AI assistants to query SDK information

## Package Resolution

The SDK automatically discovers packages using Node.js's `require.resolve()`. This means:

- **No manual path configuration needed** - packages are found automatically
- **Works with workspaces** - supports npm/yarn/pnpm workspace configurations
- **Flexible installation** - works with local, global, or custom module paths
- **Error handling** - clear error messages when packages aren't found

If a package isn't found, ensure:
1. The package is installed (`npm install <package-name>`)
2. The package name is spelled correctly
3. The package has an `SDK_CONTEXT.md` file in its root

**Security**: The system validates package names to prevent path traversal attacks and only accepts valid npm package name patterns.

## Troubleshooting

### Package Not Found
```
Package "@my-scope/my-sdk" not found. Is it installed?
```
**Solution**: Install the package or verify the name in your configuration.

### No SDK_CONTEXT.md Found
```
No SDK_CONTEXT.md found for @my-scope/my-sdk
```
**Solution**: Generate the context file using the command below.

## Generating SDK Context

SDK maintainers can generate `SDK_CONTEXT.md` using:

```bash
cd /path/to/sdk-project
npx amasdk-update-sdk-context --interactive
```
