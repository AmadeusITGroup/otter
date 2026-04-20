---
trigger: always_on
---

# Otter Framework - Runtime & Setup

## Runtime Requirements

**Always respect the runtime constraints declared in `package.json`.**

- **Node.js**: Use a version satisfying `engines.node` field in root `package.json`
- **Yarn**: Use Yarn Berry **Never use `npm install` or `pnpm`** (version defined by `packageManager` field in root `package.json`)

## Setup and Bootstrap

From repo root:

```bash
# Install dependencies (always first)
yarn install

# Optional: clear Nx cache when debugging
yarn nx reset
```
