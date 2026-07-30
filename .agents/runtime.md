# Runtime Requirements

**CRITICAL:** Always respect the runtime constraints declared in `package.json`.

## Package Manager

- **Package Manager:** Yarn 4.14.1 (Berry) with Plug'n'Play (PnP) enabled
- **NEVER use `npm install` or `pnpm`** - Yarn Berry only
- Version defined by `packageManager` field in root `package.json`

## Node Version

- **Node Version:** 22.17.0+ or 24.0.0+ (use LTS versions)
- Version constraint in `engines.node` field in root `package.json`

## Setup

```bash
# Install dependencies (always run first)
yarn install

# Optional: clear Nx cache when debugging
yarn nx reset
```

## Working Behind Proxy

If encountering SSL certificate issues with Yarn:
- Set `NODE_EXTRA_CA_CERTS` environment variable to your certificate path
- Or configure `httpsCertFilePath` in Yarn configuration

## Parallel Execution

To speed up builds/tests on multi-core machines:

```bash
# Set NX_PARALLEL environment variable
yarn print:nx-parallel >> .env
```

This sets `NX_PARALLEL` to `cpus - 1` (minimum 2).
