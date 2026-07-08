---
trigger: always_on
---

# Otter Framework - Repository Overview

## Type

Large Nx-powered monorepo for the **Otter Framework**

## Purpose

Highly modular Angular-based framework and tooling to accelerate building Angular web apps:
- Reusable Angular libraries (`packages/@o3r/*`, `@ama-sdk/*`, `@ama-openapi/*`, `@ama-mcp/*`, `@ama-mfe/*`, `@ama-styling/*`)
- Dev tools (VS Code / Chrome extensions, GitHub Actions, CLIs, design tooling, OpenAPI tooling)
- Showcase app (`apps/showcase`) and other apps

## Main Tech Stack

- Angular, TypeScript, RxJS, Redux-style patterns
- Nx monorepo tooling
- Jest for unit/integration tests, Playwright for e2e
- ESLint (flat config), Stylelint, Husky, lint-staged

## Layout

Root monorepo with `apps/`, `packages/`, and `tools/` as main code roots
