# Repository Overview

**Type:** Large Nx-powered monorepo for the **Otter Framework**

**Purpose:** Highly modular Angular-based framework and tooling to accelerate building Angular web apps:
- Reusable Angular libraries (`packages/@o3r/*`, `@ama-sdk/*`, `@ama-openapi/*`, `@ama-mcp/*`, `@ama-mfe/*`, `@ama-styling/*`)
- Dev tools (VS Code / Chrome extensions, GitHub Actions, CLIs, design tooling, OpenAPI tooling)
- Showcase app (`apps/showcase`) and other apps

**Main Tech Stack:**
- Angular, TypeScript, RxJS, Redux-style patterns (NgRx)
- Nx monorepo tooling
- Jest for unit/integration tests, Vitest for type module packages' unit tests, Playwright for E2E
- ESLint (flat config), Stylelint, Husky, lint-staged

## Project Structure

```
├── apps/                              # Applications (showcase, extensions, etc.)
├── packages/
│   ├── @o3r/*                         # Core Otter framework libraries
│   ├── @ama-sdk/*                     # SDK-related packages
│   ├── @ama-openapi/*                 # OpenAPI tooling
│   ├── @ama-styling/*                 # Styling/design tooling (figma-sdk, figma-extractor, style-dictionary)
│   ├── @ama-mcp/*                     # MCP (Model Context Protocol) tooling
│   ├── @ama-mfe/*                     # Micro-frontend utilities
│   └── @o3r-training/*                # Training materials
├── mcps/                              # MCP servers
├── tools/
│   ├── github-actions/*               # Local GitHub Actions
│   └── @o3r/*                         # Internal build/test helpers
├── docs/                              # Documentation organized by module
└── migration-guides/                  # Version migration guides
```

## Package Scopes

| Scope | Purpose | Angular-based |
|-------|---------|---------------|
| `@o3r/*` | Core Otter framework libraries | Yes |
| `@ama-sdk/*` | SDK generation and client utilities | Partial |
| `@ama-openapi/*` | OpenAPI tooling and CLI | No |
| `@ama-styling/*` | Styling and design tooling | No |
| `@ama-mcp/*` | MCP (Model Context Protocol) tooling | No |
| `@ama-mfe/*` | Micro-frontend utilities | Yes |

## Core Otter Modules

- **@o3r/core**: Base framework, component architecture
- **@o3r/components**: Component metadata and configuration
- **@o3r/configuration**: Dynamic configuration system
- **@o3r/localization**: i18n and translation management
- **@o3r/rules-engine**: Business rules engine
- **@o3r/store-sync**: NgRx store synchronization
- **@o3r/apis-manager**: API call management
- **@o3r/routing**: Enhanced routing capabilities
- **@o3r/dynamic-content**: CMS integration
