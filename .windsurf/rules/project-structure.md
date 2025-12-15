---
trigger: always_on
---

# Otter Framework - Project Structure Reference

## Directory Layout

```
├── apps/                              # Applications (showcase, extensions, etc.)
├── packages/
│   ├── @o3r/*                         # Core Otter framework libraries
│   ├── @ama-sdk/*                     # SDK-related packages
│   ├── @ama-openapi/*                 # OpenAPI tooling
│   ├── @ama-styling/*                 # Styling/design tooling
│   ├── @ama-mcp/*                     # MCP tooling
│   └── @ama-mfe/*                     # Micro-frontend utilities
├── tools/
│   ├── github-actions/*               # Local GitHub Actions
│   └── @o3r/*                         # Internal build/test helpers
├── docs/                              # Documentation
└── migration-guides/                  # Version migration guides
```

## Package Scopes

| Scope | Purpose | Angular |
|-------|---------|---------|
| `@o3r/*` | Core Otter framework libraries | Yes |
| `@ama-sdk/*` | SDK generation and client utilities | Partial |
| `@ama-openapi/*` | OpenAPI tooling and CLI | No |
| `@ama-styling/*` | Styling and design tooling | No |
| `@ama-mcp/*` | MCP (Model Context Protocol) tooling | No |
| `@ama-mfe/*` | Micro-frontend utilities | Yes |

## Additional Resources

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full contribution guidelines