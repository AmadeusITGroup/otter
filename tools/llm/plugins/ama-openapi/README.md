# Amadeus OpenAPI Plugin

A plugin LLM tool Plugin that provides skills for working with Amadeus OpenAPI specification projects. This plugin helps you create, manage, and configure OpenAPI projects using the `@ama-openapi` tooling.

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

**Usage**: Invoked by LLM when discussing adding external models

**When to use**:

- Importing models from external OpenAPI libraries
- Reusing shared models across projects
- Adding dependencies from npm packages with OpenAPI specs

**Invocation**: Both user and LLMs

**What it provides**:

- npm/yarn installation commands
- Guidance on locating the model in node_modules
- Instructions for registering in `openapi.manifest.json`

### 3. rename-model

Renames an OpenAPI model by configuring transforms in the manifest.

**Usage**: Invoked by LLM when discussing model naming

**When to use**:

- Model names don't match your naming conventions
- Avoiding naming conflicts
- Need more descriptive names for external models
- Maintaining API consistency

**Invocation**: Both user and LLMs

**What it does**:

- Configures `transforms.rename` in the manifest
- Preserves original specification
- Only affects generated code

### 4. create-mask

Creates field masks to expose only specific model fields.

**Usage**: Invoked by LLM when discussing field visibility

**When to use**:

- Exposing only a subset of model properties
- Creating different views of the same model (public vs internal)
- Hiding sensitive fields from external APIs
- Reducing payload sizes

**Invocation**: Both user and LLMs

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

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- An OpenAPI project or intent to create one

## Usage Examples

### Creating a New Project

User: "I want to create a new OpenAPI project called flight-search"

LLM will invoke the `create-openapi-project` skill and provide the command:

```bash
npm create @ama-openapi flight-search
```

### Adding an External Model

User: "I need to add the Passenger model from @travel/api-models"

LLM will invoke `add-dependency-model` and provide:

1. Installation command
2. Instructions to locate the model
3. Manifest configuration

### Renaming a Model

User: "The FlightOfferDetails model should be renamed to just Flight"

LLM will invoke `rename-model` and show how to update the manifest:

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

LLM will invoke `create-mask` and configure the transforms:

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

- [`@ama-openapi/core`](../../../../packages/@ama-openapi/core) - Core OpenAPI utilities
- `npm create @ama-openapi` - Project scaffolding tool

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
- Open an issue in the [Otter repository](https://github.com/AmadeusITGroup/otter/issues)

## License

See the root [LICENSE](../../../../LICENSE) file for details.
