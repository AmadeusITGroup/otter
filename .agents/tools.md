# Development Tools

## Verdaccio (Local NPM Registry)

Used for integration testing and local package testing:

```bash
# Start Verdaccio in Docker
yarn verdaccio:start

# Start locally without Docker
yarn verdaccio:start-local

# Publish all packages to local registry
yarn verdaccio:publish

# Stop Verdaccio
yarn verdaccio:stop

# Clean Verdaccio storage
yarn verdaccio:clean
```

Verdaccio configuration is in `.verdaccio/conf/`.

## Documentation Generation

```bash
# Generate all documentation
yarn doc:generate

# Generate root documentation
yarn doc:root

# Generate package-specific documentation
yarn doc:packages

# Generate specific package documentation
yarn nx documentation <package-name>
```

Documentation is generated using Compodoc and output to `generated-doc/`.

## VSCode Integration

The repository includes VSCode configuration:
- Recommended extensions in `.vscode/extensions.json`
- Launch configurations for debugging in `.vscode/launch.json`
- Use `vscode-jest-tests` debugger task to debug unit tests with breakpoints
