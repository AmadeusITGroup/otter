# SDK Context for AI Tools

This document provides context about the generated TypeScript SDK to help AI assistants understand the codebase structure and avoid hallucinations.

## SDK Information

- **Package Name**: `@o3r-training/training-sdk`
- **OpenAPI Version**: `3.0.2`
- **API Title**: Otter Training SDK
- **Generated with**: `@ama-sdk/schematics:typescript-core`

## Project Structure

```
@o3r-training/training-sdk/
├── api/                    # API endpoint classes (domain-based)
│   ├── dummy/              # Dummy operations...
│   └── index.ts
├── models/
│   ├── base/               # Auto-generated from OpenAPI (DO NOT MODIFY)
│   ├── core/               # Extensions of base models if needed
│   ├── custom/             # Custom business models if needed
│   └── index.ts
├── spec/                   # Operation specifications
├── fixtures/               # Test fixtures
├── open-api.yaml               # OpenAPI specification source
└── openapitools.json           # Generator configuration
```

<!-- DOMAINS-START -->
## Domains

The following domains were extracted from the OpenAPI specification. Each domain represents a logical grouping of related API operations.


### dummy

**What this domain is about**: Dummy operations

**API Class**: `src/api/dummy/dummy-api.ts`

**Available Operations:**

| Operation ID | Method | Description |
|--------------|--------|-------------|
| `dummyGet` | GET | Dummy get |

**Models used in this domain:**
- `Flight` - imported from `src/models/base/flight/`


<!-- DOMAINS-END -->

## Important Guidelines

### DO NOT

- Modify files in `models/base/` - these are auto-generated
- Invent operation IDs that don't exist in the domains above
- Assume model properties not defined in the OpenAPI spec
- Create new API classes outside the domain structure

### DO

- Use the exact operation IDs listed above
- Reference models from `models/base/` (or `src/models/base/` in case mcp server is running in the o3r/framework project) for type definitions
- Check `api/{domain}/{domain}-api.ts` for available methods

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->

 (No disambiguation notes added yet. Run with --interactive to add notes.)


---

*This file was generated using `amasdk-update-sdk-context`. Re-run after SDK regeneration to update domains.*
