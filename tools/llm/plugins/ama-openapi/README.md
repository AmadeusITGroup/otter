# Amadeus OpenAPI Plugin

A Claude Code plugin that provides skills for working with Amadeus OpenAPI specification projects. This plugin helps you create, manage, and configure OpenAPI projects using the `@ama-openapi` tooling.

## Overview

This plugin converts the functionality of the [`@ama-openapi/mcp`](../../packages/@ama-openapi/mcp) MCP server into Claude Code skills, providing a more integrated experience for working with OpenAPI specifications.

## Skills

The plugin includes four skills:

### 1. create-openapi-project

Creates a new OpenAPI specification project with predefined structure and configuration.

**Usage**: `/create-openapi-project`

**When to use**:
- Starting a new API specification project
- Need a scaffolded OpenAPI project structure
- Want to use Amadeus OpenAPI tooling conventions

**Invocation**: User-only (creates project files)

### 2. add-dependency-model

Adds an external OpenAPI model from a library package as a dependency.

**Usage**: Invoked by Claude when discussing adding external models

**When to use**:
- Importing models from external OpenAPI libraries
- Reusing shared models across projects
- Adding dependencies from npm packages with OpenAPI specs

**Invocation**: Both user and Claude

**What it provides**:
- npm/yarn installation commands
- Guidance on locating the model in node_modules
- Instructions for registering in `openapi.manifest.json`

### 3. rename-model

Renames an OpenAPI model by configuring transforms in the manifest.

**Usage**: Invoked by Claude when discussing model naming

**When to use**:
- Model names don't match your naming conventions
- Avoiding naming conflicts
- Need more descriptive names for external models
- Maintaining API consistency

**Invocation**: Both user and Claude

**What it does**:
- Configures `transforms.rename` in the manifest
- Preserves original specification
- Only affects generated code

### 4. create-mask

Creates field masks to expose only specific model fields.

**Usage**: Invoked by Claude when discussing field visibility

**When to use**:
- Exposing only a subset of model properties
- Creating different views of the same model (public vs internal)
- Hiding sensitive fields from external APIs
- Reducing payload sizes

**Invocation**: Both user and Claude

**What it does**:
- Configures `transforms.masks` in the manifest
- Supports nested objects
- Can create multiple named masks

## Installation

### As a Local Plugin

1. Ensure you're in the Otter repository root
2. The plugin is available at `tools/llm/plugins/ama-openapi`
3. Install it in Claude Code:
   ```bash
   claude plugin install tools/llm/plugins/ama-openapi
   ```

### MCP Server (Optional)

This plugin also includes an optional MCP server configuration that provides the same tools through the Model Context Protocol. The MCP server is automatically configured when you install the plugin.

To use the MCP server directly (without the plugin), add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "ama-openapi": {
      "command": "npx",
      "args": ["-y", "-p", "@ama-openapi/mcp", "ama-openapi-mcp"]
    }
  }
}
```

**Skills vs MCP Server**: Skills provide better integration with Claude Code (custom invocation modes, rich documentation), while the MCP server offers compatibility with any MCP-enabled client.

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- An OpenAPI project or intent to create one

## Usage Examples

### Creating a New Project

User: "I want to create a new OpenAPI project called flight-search"

Claude will invoke the `create-openapi-project` skill and provide the command:
```bash
npm create @ama-openapi flight-search
```

### Adding an External Model

User: "I need to add the Passenger model from @travel/api-models"

Claude will invoke `add-dependency-model` and provide:
1. Installation command
2. Instructions to locate the model
3. Manifest configuration

### Renaming a Model

User: "The FlightOfferDetails model should be renamed to just Flight"

Claude will invoke `rename-model` and show how to update the manifest:
```json
{
  "models": {
    "FlightOfferDetails": {
      "transforms": {
        "rename": "Flight"
      }
    }
  }
}
```

### Creating a Mask

User: "I want to expose only the public fields of the User model"

Claude will invoke `create-mask` and configure the transforms:
```json
{
  "transforms": {
    "masks": {
      "properties": {
        "id": true,
        "name": true,
        "email": true
      }
    }
  }
}
```

## Related Packages

- [`@ama-openapi/core`](../../packages/@ama-openapi/core) - Core OpenAPI utilities
- `npm create @ama-openapi` - Project scaffolding tool

## File Structure

```
tools/llm/plugins/ama-openapi/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata for Claude
├── skills/
│   ├── create-openapi-project.md
│   ├── add-dependency-model.md
│   ├── rename-model.md
│   └── create-mask.md
├── .mcp.json                # Optional MCP server configuration
├── plugin.json              # Plugin manifest
└── README.md               # This file
```

## Development

### Converting MCP Tools to Skills

Each MCP tool in `packages/@ama-openapi/mcp/src/server/tools/` has been converted to a skill:

| MCP Tool | Skill | Key Changes |
|----------|-------|-------------|
| `create_openapi_project` | `create-openapi-project.md` | User-only invocation (side effects) |
| `add_dependency_model` | `add-dependency-model.md` | Expanded with npm keywords |
| `rename_model` | `rename-model.md` | Added YAML examples |
| `create_mask` | `create-mask.md` | Added nested object examples |

### Skill Guidelines

When converting MCP tools to skills:

1. **Preserve core functionality** - Keep the same validation and logic
2. **Expand documentation** - Skills can include more examples and context
3. **Set invocation modes**:
   - `disable-model-invocation: true` for user-only (side effects)
   - Default (omit) for both Claude and user
4. **Include examples** - Show common use cases
5. **Add troubleshooting** - Help users resolve common issues

## Contributing

When adding new skills:

1. Create skill file in `skills/` directory
2. Follow the YAML frontmatter format
3. Include comprehensive documentation
4. Add examples and troubleshooting
5. Update this README

## Support

For issues or questions:
- Check the [Otter documentation](https://github.com/AmadeusITGroup/otter)
- Review the [@ama-openapi/mcp README](../../packages/@ama-openapi/mcp/README.md)
- Open an issue in the [Otter repository](https://github.com/AmadeusITGroup/otter/issues)

## License

See the root [LICENSE](../../LICENSE) file for details.
