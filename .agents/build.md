# Build System

This project uses Nx for task orchestration with extensive caching.

## Build Commands

```bash
# Build all packages (includes TypeScript and JAR if applicable)
yarn build

# Build TypeScript only (faster, excludes JAR)
yarn build:ts

# Build specific package
yarn nx build <package-name>

# Build affected packages only
yarn build:affected

# Build tools needed after install
yarn build:tools
```

## Build Targets

Packages may have multiple build targets depending on their type:

- `compile` - TypeScript compilation
- `build-builders` - Angular builders/schematics
- `build-cli` - CLI tools
- `build-fixtures` - Test fixtures
- `expose-templates` - Copy schematic templates
- `expose-schemas` - Copy JSON schemas
- `prepare-build-builders` - Prepare builder metadata

Results are output to each package's `dist/` directory (`packages/@<scope>/<name>/dist`).

## Nx Cache Management

Nx caches build, test, and lint outputs. To clear the cache:

```bash
yarn nx reset
```

Use this when investigating issues or when cache seems stale.

## Development Workflow

### Creating New Packages

```bash
# Create a new scope
yarn create:scope <scope-name>

# Create a new library in a scope
yarn ng g library @<scope-name>/<library-name>
```

## Schematics and Builders

Many packages include Angular schematics and builders:
- Schematics: code generators for Angular CLI
- Builders: custom build/test/lint executors for Angular CLI
- Templates: located in `schematics/*/templates/` or `builders/*/templates/`
- Schemas: JSON schemas in `schemas/` directory

To work on schematics/builders, build with `yarn nx build-builders <package-name>`.
