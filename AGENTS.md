# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

Following the [agents.md](https://github.com/agentsmd/agents.md) specification for cross-LLM compatibility.

---

## Quick Start

**Type:** Large Nx-powered monorepo for the **Otter Framework** - Angular-based framework and tooling

**Essential Commands:**

```bash
yarn install        # Install dependencies (always first)
yarn build          # Build all packages
yarn lint           # Lint (mandatory before PR)
yarn test           # Unit tests (mandatory before PR)
```

**Package Manager:** Yarn 4.14.1 (Berry) with PnP - **NEVER use npm or pnpm**
**Node Version:** 22.17.0+ or 24.0.0+

---

## Context Files

Detailed documentation is split into context-specific files in `.agents/` to reduce token usage. Load only what you need for your current task:

### Always Relevant

- **[overview.md](./.agents/overview.md)** - Repository structure, tech stack, and package scopes

### Task-Specific Context

**Building & Development:**

- **[build.md](./.agents/build.md)** - Build system, commands, and Nx targets
- **[runtime.md](./.agents/runtime.md)** - Runtime requirements and setup

**Code Quality:**

- **[testing.md](./.agents/testing.md)** - Unit, integration, and E2E testing guidelines
- **[linting.md](./.agents/linting.md)** - ESLint configuration and linting commands
- **[code-style.md](./.agents/code-style.md)** - TypeScript conventions, JSDoc, and best practices

**Version Control:**

- **[git-workflow.md](./.agents/git-workflow.md)** - Git workflow, commit messages, protected branches, and CI/CD rules

**Contributing:**

- **[contributing.md](./.agents/contributing.md)** - Contribution rules, PR process, and quality requirements

**Advanced Features:**

- **[advanced.md](./.agents/advanced.md)** - Otter-specific concepts, metadata extraction, core modules
- **[tools.md](./.agents/tools.md)** - Verdaccio, documentation generation, VSCode integration

---

## Critical Rules

**NEVER:**

- Use `npm install` or `pnpm` - Yarn Berry only
- Commit directly to `main` or `release/*` branches
- Modify CI workflows (`.github/workflows/*`) unless explicitly requested
- Skip linting or testing before submitting PRs

**ALWAYS:**

- Run `yarn build && yarn lint && yarn test` before considering changes complete
- Write JSDoc comments for exported functions, classes, methods, and properties
- Add unit tests for new code
- Use conventional commit messages (see [git-workflow.md](./.agents/git-workflow.md))
- Use the most restricted type possible for TypeScript properties

---

## Framework Versions

- Angular: ~21.2.4
- TypeScript: ~5.9.2
- RxJS: ^7.8.1
- NgRx: ~21.1.0
- Nx: ~22.7.0

---

## About This File

This AGENTS.md follows the [agents.md](https://github.com/agentsmd/agents.md) specification. Context is split into separate files in `.agents/` to optimize token usage - load only what you need for your current task.

**Maintaining:**

- Update context files when build commands, structure, or workflows change
- Keep versions up-to-date
- AI agents with edit permissions can maintain these files
