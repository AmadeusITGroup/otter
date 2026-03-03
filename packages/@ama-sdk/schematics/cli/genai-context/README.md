# SDK Context CLI Integration Guide

This guide explains how to use the `amasdk-update-sdk-context` CLI tool to expose SDK context files for AI assistants.

## Overview

The SDK Context CLI extracts domain information from OpenAPI specifications and generates an `SDK_CONTEXT.md` file that provides AI assistants with structured information about your SDK's structure, operations, and models. This context helps AI tools avoid hallucinations and provide more accurate assistance.

## CLI Usage

### Installation

The CLI is included in the `@ama-sdk/schematics` package:

```bash
npm install @ama-sdk/schematics
# or
yarn add @ama-sdk/schematics
```

### Basic Usage

Generate SDK context from your OpenAPI specification:

```bash
# Basic generation (looks for open-api.yaml or open-api.json in project root)
amasdk-update-sdk-context

# Specify custom spec path
amasdk-update-sdk-context --spec-path ./specs/my-api.yaml

# Interactive mode with domain validation
amasdk-update-sdk-context --interactive

# Quiet mode (minimal output)
amasdk-update-sdk-context --quiet
```

### CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--interactive` | `-i` | Run in interactive mode to validate domains and add disambiguation notes |
| `--domain-descriptions` | | Path to JSON file with custom domain descriptions |
| `--spec-path` | | Path to OpenAPI specification file (default: `open-api.yaml` or `open-api.json`) |
| `--prepare-script` | | Add a `prepare:context` script to package.json that copies SDK_CONTEXT.md to dist folder |
| `--sdk-path` | | Path to SDK directory where SDK_CONTEXT.md will be created and package.json will be modified (default: current directory) |
| `--quiet` | | Suppress non-essential output |
| `--help` | `-h` | Show help message |

### Interactive Mode

Interactive mode provides domain validation and allows you to add project-specific disambiguation notes:

```bash
amasdk-update-sdk-context --interactive
```

This will:
1. Show extracted domains with their descriptions
2. Allow you to validate or modify domain descriptions
3. Prompt for disambiguation notes (naming conventions, domain relationships, etc.)
4. Preserve existing notes from previous runs

### Custom Domain Descriptions

Create a `domain-descriptions.json` file to override automatically extracted descriptions:

```json
{
  "user-management": "Handles user authentication, registration, and profile management",
  "order-processing": "Manages order lifecycle from creation to fulfillment",
  "inventory": "Controls product inventory and stock levels"
}
```

Use it with:

```bash
amasdk-update-sdk-context --domain-descriptions ./domain-descriptions.json
```

### Automatic Build Script Integration

The CLI can automatically add the necessary scripts to your `package.json` to handle copying the context file to the dist folder:

```bash
# Add prepare:context script and update build script (current directory)
amasdk-update-sdk-context --prepare-script

# Specify custom SDK directory
amasdk-update-sdk-context --prepare-script --sdk-path ./packages/my-sdk

# With all options
amasdk-update-sdk-context --interactive --prepare-script --sdk-path ./packages/my-sdk --spec-path ./specs/open-api.yaml
```

**What this does:**
1. Creates `SDK_CONTEXT.md` in the specified SDK directory (or current directory)
2. Installs `cpy-cli` as a dev dependency (if not already present)
3. Adds a `prepare:context` script that copies `SDK_CONTEXT.md` to the `dist` folder using `cpy-cli`
4. Updates the `build` script to include `prepare:context` automatically

**Resulting package.json scripts:**
```json
{
  "scripts": {
    "prepare:context": "cpy SDK_CONTEXT.md dist/",
    "build": "your-existing-build-command && npm run prepare:context"
  }
}
```

## Generated SDK_CONTEXT.md Structure

The generated `SDK_CONTEXT.md` file includes:

- **SDK Information**: Package name, OpenAPI version, API title
- **Project Structure**: Directory layout and file organization
- **Domains**: Logical groupings of API operations with:
  - Domain descriptions
  - API class locations
  - Available operations (operation ID, method, description)
  - Models used by each domain
- **Guidelines**: DO's and DON'Ts for AI tools
- **User Disambiguation Notes**: Project-specific clarifications

## Best Practices

### 1. Maintain Accurate Context

- **Regenerate after API changes**: Run `amasdk-update-sdk-context` after updating your OpenAPI spec
- **Review domain descriptions**: Use interactive mode to ensure descriptions are accurate
- **Add disambiguation notes**: Include project-specific conventions and relationships

### 2. Optimize for AI Assistance

- **Clear operation naming**: Use descriptive operation IDs in your OpenAPI spec
- **Logical domain grouping**: Organize operations into meaningful domains using tags
- **Comprehensive descriptions**: Provide detailed descriptions for domains and operations

### 3. Version Management

- **Include in CI/CD**: Add context generation to your build pipeline
- **Version with SDK**: Ensure `SDK_CONTEXT.md` matches the published SDK version
- **Document changes**: Track context changes in your changelog

### 4. Publishing Workflow

```bash
# 1. Update OpenAPI specification
# 2. Build SDK and generate context (includes copy to dist)
npm run build

# 3. Review and commit
git add SDK_CONTEXT.md
git commit -m "Update SDK context for v1.2.3"

# 4. Publish
npm publish
```

**Domain extraction issues**
- **Incorrect domains**: Use `--domain-descriptions` to override automatic extraction
- **Missing operations**: Verify your OpenAPI spec has proper operation IDs
- **Poor descriptions**: Use interactive mode to improve domain descriptions

## Examples

### Example 1: Basic SDK Setup

```bash
# Create new SDK
npm create @ama-sdk typescript my-sdk -- --spec-path ./api-spec.yaml
cd my-sdk

# Generate SDK
npm run generate

# Generate context and automatically set up build scripts
amasdk-update-sdk-context --interactive --prepare-script

# Build SDK (includes copying context to dist)
npm run build

# Publish
npm publish
```

### Example 2: Monorepo SDK Setup

```bash
# In monorepo root
amasdk-update-sdk-context --interactive --prepare-script --sdk-path ./packages/my-sdk

# Then build and publish from the SDK directory
cd packages/my-sdk
npm run build
npm publish
```

### Example 3: Custom Domain Descriptions

```json
// domain-descriptions.json
{
  "authentication": "User login, registration, and token management",
  "user-profile": "Profile CRUD operations and preferences",
  "notifications": "Push notifications, emails, and alerts"
}
```

## Advanced Usage

### Script Integration

The recommended approach is to use the `--prepare-script` flag which automatically sets up the build integration:

```bash
amasdk-update-sdk-context --prepare-script
```

Alternatively, add custom scripts to your `package.json`:

```json
{
  "scripts": {
    "generate:context": "amasdk-update-sdk-context",
    "prepare:context": "cpy SDK_CONTEXT.md dist/",
    "build": "your-existing-build-command && npm run prepare:context",
    "prepublishOnly": "npm run build"
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/publish.yml
- name: Build SDK and Generate Context
  run: |
    npm run build

- name: Verify Context
  run: |
    test -f dist/SDK_CONTEXT.md || (echo "SDK_CONTEXT.md not found in dist folder" && exit 1)
```

## Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [@ama-sdk/schematics Documentation](https://github.com/AmadeusITGroup/otter/tree/main/packages/@ama-sdk/schematics)
