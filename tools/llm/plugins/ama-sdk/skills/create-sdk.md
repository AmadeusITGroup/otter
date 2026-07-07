---
name: create-sdk
description: Create a new TypeScript SDK from an OpenAPI specification, either as a standalone project or inside an existing Angular/Nx monorepo. Use when user wants to scaffold, bootstrap, initialize, or generate an SDK.
---

# Create SDK

Generate a TypeScript SDK from an OpenAPI specification — standalone or within a monorepo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- An OpenAPI 3.x or Swagger 2.0 specification file (YAML or JSON)
- For monorepo: an existing Angular/Nx workspace (`angular.json` or `nx.json`)

## Determine Context

Before running commands, check the working directory:

- **`angular.json` or `nx.json` exists** → monorepo workflow (Step A)
- **No workspace file** → standalone workflow (Step B)

---

## Step A: Monorepo Workflow

### A1. Add @ama-sdk/schematics to the workspace

```bash
ng add @ama-sdk/schematics
```

### A2. Scaffold the SDK shell

```bash
ng generate @ama-sdk/schematics:typescript-shell --name=my-sdk
```

This creates a library project (e.g., `libs/my-sdk/`) with `package.json`, `tsconfig.json`, and the source directory structure.

### A3. Generate SDK from spec

```bash
ng generate @ama-sdk/schematics:typescript-core --spec-path=./path/to/openapi.yaml
```

Run from inside the SDK library directory, or pass the project name if supported by your workspace.

### A4. Generate mocks (optional)

```bash
ng generate @ama-sdk/schematics:typescript-mock
```

### A5. Workspace integration

- **tsconfig paths**: Map the SDK package name in `tsconfig.base.json` (e.g., `"@my-org/my-sdk": ["libs/my-sdk/src/index.ts"]`)
- **Build order**: If using Nx, the SDK library is buildable and other projects can depend on it
- **Importing**: Other apps import from the SDK by package name

### A6. Regeneration

When the OpenAPI spec changes:

```bash
ng generate @ama-sdk/schematics:typescript-core --spec-path=./path/to/updated-spec.yaml
```

This regenerates `src/api/` and `src/models/base/` while preserving custom core models.

---

## Step B: Standalone Workflow

### B1. Create the SDK project

**From a local spec file:**
```bash
npm create @ama-sdk typescript @scope/my-sdk -- --spec-path ./path/to/openapi.yaml
```

**From an npm package containing the spec:**
```bash
npm create @ama-sdk typescript @scope/my-sdk -- --spec-package-name @scope/my-spec --spec-package-registry https://registry.example.com
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--spec-path` | Path to a local OpenAPI spec file |
| `--spec-package-name` | npm package name containing the spec |
| `--spec-package-registry` | Custom npm registry URL for the spec package |
| `--spec-package-path` | Path within the npm package to the spec file |
| `--spec-package-version` | Specific version of the spec package |
| `--package-manager` | Package manager to use (`npm` or `yarn`) |
| `--exact-o3r-version` | Pin exact Otter framework versions |
| `--dry-run` | Preview without writing files |

### B2. Generated structure

```
my-sdk/
├── package.json
├── tsconfig.json
├── src/
│   ├── api/          # Generated API classes (one per tag/path group)
│   ├── models/       # Generated TypeScript interfaces and revivers
│   │   ├── base/     # Base models (direct from spec)
│   │   └── core/     # Core models (extended with runtime features)
│   ├── fixtures/     # Mock data for testing
│   └── spec/         # Copy of the source specification
└── testing/
    └── index.ts      # Mock API exports
```

### B3. Regeneration

```bash
npx schematics @ama-sdk/schematics:typescript-core --spec-path ./path/to/updated-spec.yaml
```

This overwrites `src/api/` and `src/models/base/` but preserves custom extensions in `src/models/core/`.

### B4. Generate mocks (optional)

```bash
npx schematics @ama-sdk/schematics:typescript-mock
```

### B5. Build

```bash
npm run build
```

---

## Available Schematics

| Schematic | Alias | Purpose |
|-----------|-------|---------|
| `typescript-shell` | `ama-typescript-shell` | Scaffold SDK project structure |
| `typescript-core` | `ama-typescript-core` | Generate SDK code from OpenAPI spec |
| `typescript-mock` | `ama-typescript-mock` | Generate mock API implementations |
| `api-extension` | `ama-api-extension` | Generate custom spec extensions |
| `migrate` | `ama-migrate` | Execute migration scripts between versions |

For schematic options, see: https://github.com/AmadeusITGroup/otter/blob/main/packages/@ama-sdk/schematics/collection.json

## Next Steps After Creation

- Install and configure a client (`@ama-sdk/client-fetch`, `@ama-sdk/client-angular`, or `@ama-sdk/client-beacon`) — see **use-sdk** skill
- Add plugins for auth, retry, or caching — see **sdk-plugins** skill
- Generate mocks for testing with `typescript-mock` schematic
