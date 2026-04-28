---
name: add-dependency-model
description: Add an external OpenAPI model from a library package as a dependency. Provides npm/yarn installation commands and guidance on registering the model in openapi.manifest.json.
---

# Add Dependency Model

Adds an external OpenAPI model from a library package as a dependency to your OpenAPI project.

## Usage

Use this skill when you need to:
- Import models from external OpenAPI libraries
- Reuse shared models across projects
- Add dependencies from npm packages containing OpenAPI specifications

## Process

### Step 1: Install the Library Package

If the library name is known:
```bash
npm install <library-name>[@~<version>]
# or
yarn add <library-name>[@~<version>]
```

If the library name is unknown:
1. Inspect installed NPM packages with OpenAPI-related keywords:
   - `openapi`
   - `openapi-model`
   - `openapi-spec`
   - `swagger`
   - `api-spec`
<!-- This keywords list comes from the constant OPENAPI_NPM_KEYWORDS exposed by the package @ama-openapi/core -->
2. Look for the model file by:
   - Matching filename with the model name
   - Or find a matching model under the node `components.schemas` within the large JSON or YAML openapi specification files in the package

### Step 2: Locate the Model

Find the model in `node_modules/<library-name>/`:
- Look for files matching the model name
- Or find a matching model under the node `components.schemas` within the large JSON or YAML openapi specification files in the package

### Step 3: Register in Manifest

Add the model to `openapi.manifest.json` (or `openapi.manifest.yaml`):

```json
{
  "models": {
    "<library-name>": {
      "path": "<relative-path-from-node_modules-to-model-file>"
    }
  }
}
```

The path should be relative from the `node_modules` directory and can include inner-path references if needed.

## Example

Adding a `Flight` model from `@travel/api-models` library:

1. Install:
   ```bash
   npm install @travel/api-models@~1.2.0
   ```

2. Locate model in `node_modules/@travel/api-models/models/Flight.yaml`

3. Register in `openapi.manifest.json`:
   ```json
   {
     "models": {
       "@travel/api-models": {
         "path": "@travel/api-models/models/Flight.yaml"
       }
     }
   }
   ```

## Version Management

- Use `~` for patch version flexibility (e.g., `~1.2.0` allows 1.2.x)
- Use `^` for minor version flexibility (e.g., `^1.2.0` allows 1.x.x)
- Specify exact version if strict compatibility is required

## Troubleshooting

**Model not found**: Verify the package exports OpenAPI models by checking:
- Package.json keywords
- README documentation
- Package contents in node_modules

**Wrong path**: Ensure the path in manifest is relative from node_modules, not from your project root.
