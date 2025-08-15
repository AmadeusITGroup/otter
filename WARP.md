# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Otter Framework** is a highly modular Angular framework designed to accelerate web application development. Built by Amadeus IT Group, it provides comprehensive tooling for configuration management, component development, localization, testing, and CMS integration.

## Core Architecture

The framework follows a **monorepo structure** with multiple scopes:

### Package Structure
- **@o3r/*** - Core Otter framework packages (40+ modules)
- **@ama-sdk/*** - API SDK generation tools and utilities  
- **@ama-terasu/*** - CLI and core tooling utilities
- **@ama-mfe/*** - Micro-frontend utilities
- **@ama-styling/*** - Design system and styling tools
- **@o3r-training/*** - Training and documentation packages

### Key Directories
- `packages/` - All npm packages organized by scope
- `apps/` - Applications (showcase, chrome devtools, vscode extension)
- `tools/` - Build helpers and GitHub Actions
- `docs/` - Comprehensive technical documentation

### Core Dependencies
The framework is built on:
- **Angular 19.x** with modern tooling
- **Nx** for monorepo management and build orchestration
- **TypeScript 5.8.x** for type safety
- **RxJS** for reactive programming
- **Redux/NgRx** for state management
- **Sass** for styling

## Development Commands

### Essential Build Commands
```bash
# Build all packages (uses Nx orchestration with dynamic targets)
yarn build

# Build only TypeScript packages (fastest)
yarn build:ts

# Build specific package
yarn nx build <package-name>

# Build affected packages only
yarn build:affected

# Build tools needed for development (linting, workspace setup)
yarn build:tools

# Build swagger/OpenAPI templates (requires Java 17+ and Maven)
yarn build:swagger-gen
```

### Testing Commands
```bash
# Run all unit tests
yarn test

# Run tests for specific package
yarn nx test <package-name>

# Run integration tests
yarn test-int

# Run e2e tests
yarn test-e2e

# Run affected tests only
yarn test:affected
```

### Development Quality
```bash
# Run linting across all packages
yarn lint

# Lint specific package
yarn nx lint <package-name>

# Lint affected packages only
yarn lint:affected

# Format and fix issues
yarn lint:affected --fix
```

### Package Management
```bash
# Clean all build artifacts
yarn clear

# Reset Nx cache (useful for troubleshooting)
yarn nx reset

# Harmonize package versions across workspace
yarn harmonize:version

# Create a new scope in the monorepo
yarn create:scope <scope-name>

# Get optimal CPU parallelization for builds
yarn print:nx-parallel >> .env
```

### Local Development
```bash
# Start development servers for modules
yarn start:modules

# Watch VSCode extension changes
yarn watch:vscode-extension
```

## Testing Strategy

### Test Types
- **Unit Tests**: Jest-based testing for all packages
- **Integration Tests**: Real-world package interaction testing with Verdaccio
- **E2E Tests**: Playwright-based end-to-end testing
- **Visual Regression**: Screenshot comparison testing

### Running Specific Tests
```bash
# Test core package only
yarn nx test core

# Test components package with coverage
yarn nx test components --codeCoverage

# Run integration tests for schematics
yarn nx test-int schematics
```

## Key Framework Concepts

### Package Categories

**Core Infrastructure:**
- `@o3r/core` - Foundation interfaces and schematics
- `@o3r/schematics` - Base schematic utilities
- `@o3r/workspace` - Monorepo and build tooling

**Application Features:**
- `@o3r/components` - Component framework with CMS integration
- `@o3r/configuration` - Runtime configuration management
- `@o3r/localization` - i18n with fallback support
- `@o3r/routing` - Enhanced Angular routing
- `@o3r/forms` - Advanced form utilities and validation

**Development Tools:**
- `@o3r/testing` - E2E and visual testing utilities  
- `@o3r/chrome-devtools` - Debug tools Chrome extension
- `@o3r/vscode-extension` - IDE integration

**Advanced Features:**
- `@o3r/rules-engine` - CMS-driven customization engine
- `@o3r/analytics` - Event tracking framework
- `@o3r/styling` - Theme and design token management
- `@o3r/dynamic-content` - Runtime content loading

### Architectural Patterns

**Monorepo Management:**
- Uses Nx for dependency graphs and caching
- Workspace-based package references (`workspace:^`)
- Shared build and lint configurations
- Parallel execution with intelligent caching

**Package Dependencies:**
- Most packages depend on `@o3r/core` as foundation
- Clear dependency hierarchy prevents circular references
- Optional peer dependencies for modular adoption
- Generator dependencies for schematic installation

**Build System:**
- TypeScript compilation with incremental builds
- Nx target-based execution (compile → build → test)
- ESM2022 and CommonJS dual output
- Source maps and declaration files

## Working with Schematics

The framework provides extensive Angular schematics:

```bash
# Generate new Otter application
npm create @o3r my-project

# Generate Otter project with Yarn package manager
npm create @o3r my-project -- --yarn

# Generate component with Otter features
yarn ng g @o3r/core:component my-component

# Generate application, library or SDK in existing project
yarn ng generate application my-webapp
yarn ng generate library my-library
yarn ng generate sdk my-sdk

# Add Otter modules to existing project
yarn ng add @o3r/configuration
yarn ng add @o3r/localization
```

## Development Environment

### Prerequisites
- **Node.js** ≥20.11.1 (LTS recommended)
- **Yarn** ≥2.0.0 (using Yarn 4.9.2 with PnP)
- **Chrome** for testing
- **Java 17+** and **Maven** (optional, for OpenAPI template generation)
- **Git** for version control

### IDE Setup
- Comprehensive VSCode configuration included
- Debugger configurations for Jest testing
- ESLint and TypeScript integration
- Recommended extensions list

### Performance Tips
```bash
# Set parallel execution based on CPU cores
yarn print:nx-parallel >> .env

# Enable Nx Cloud remote caching (team members)
# See CONTRIBUTING.md for setup instructions
```

## Documentation Structure

Extensive documentation is available in `docs/`:
- Package-specific guides in `docs/<topic>/`
- Architecture overview at `docs/core/ARCHITECTURE.md`
- Getting started guide at `docs/core/START_NEW_APPLICATION.md`
- CMS integration patterns at `docs/cms-adapters/`

## Integration Testing

The project uses Verdaccio for integration testing:

```bash
# Start local npm registry
yarn verdaccio:start

# Publish packages locally and test
yarn verdaccio:all

# Clean up test packages
yarn verdaccio:clean
```

## Package Publication

```bash
# Prepare all packages for publication
yarn publish

# Publish browser extensions
yarn publish:extensions
```

## Troubleshooting

### Common Issues
- **Build failures**: Run `yarn nx reset` to clear cache
- **Dependency issues**: Run `yarn install --mode=skip-build`
- **SSL certificates**: Configure `NODE_EXTRA_CA_CERTS` for proxy environments
- **Memory issues**: Increase Node.js heap size with `--max-old-space-size`
- **Windows Git Bash**: Not fully supported; use PowerShell or Command Prompt instead
- **OpenAPI builds fail**: Ensure Java 17+ and Maven are installed

### Debug Commands
```bash
# Check Nx dependency graph
yarn nx graph

# Show affected projects
yarn nx show projects --affected

# View detailed build logs
yarn nx build <package> --verbose

# Check workspace structure
yarn workspaces:list

# Override build targets via environment
OTTER_BUILD_NX_TARGETS=build yarn build
```

## Environment Variables

- `OTTER_BUILD_NX_TARGETS` - Override default build targets (comma-separated)
- `NX_PARALLEL` - Set number of parallel tasks for Nx execution
- `NODE_EXTRA_CA_CERTS` - Path to additional CA certificates for proxy environments
- `ENFORCED_PACKAGE_MANAGER` - Enforce specific package manager for tests
- `PREPARE_TEST_ENV_TYPE` - Control test environment preparation

The Otter Framework emphasizes developer experience with comprehensive tooling, clear architectural patterns, and extensive automation through Nx and custom schematics.
