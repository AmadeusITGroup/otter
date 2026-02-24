# SDK Context for AI Tools

This document provides context about the generated TypeScript SDK to help AI assistants understand the codebase structure and avoid hallucinations.

## SDK Information

- **Package Name**: `@o3r-training/showcase-sdk`
- **OpenAPI Version**: `3.0.2`
- **API Title**: Swagger Petstore - OpenAPI 3.0
- **Generated with**: `@ama-sdk/schematics:typescript-core`

## Project Structure

```
@o3r-training/showcase-sdk/
├── api/                    # API endpoint classes (domain-based)
│   ├── pet/              # Everything about your Pets...
│   ├── store/              # Access to Petstore orders...
│   ├── user/              # Operations about user...
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

## Domains

The following domains were extracted from the OpenAPI specification. Each domain represents a logical grouping of related API operations.


### pet

**What this domain is about**: Everything about your Pets

**API Class**: `src/api/pet/pet-api.ts`

**Available Operations:**

| Operation ID | Method | Description |
|--------------|--------|-------------|
| `addPet` | POST | Add a new pet to the store |
| `updatePet` | PUT | Update an existing pet |
| `findPetsByStatus` | GET | Finds Pets by status |
| `findPetsByTags` | GET | Finds Pets by tags |
| `getPetById` | GET | Find pet by ID |
| `updatePetWithForm` | POST | Updates a pet in the store with form data |
| `deletePet` | DELETE | Deletes a pet |
| `uploadFile` | POST | uploads an image |

**Models used in this domain:**
- `Pet` - imported from `src/models/base/pet/`
- `ApiResponse` - imported from `src/models/base/api-response/`


### store

**What this domain is about**: Access to Petstore orders

**API Class**: `src/api/store/store-api.ts`

**Available Operations:**

| Operation ID | Method | Description |
|--------------|--------|-------------|
| `getInventory` | GET | Returns pet inventories by status |
| `placeOrder` | POST | Place an order for a pet |
| `getOrderById` | GET | Find purchase order by ID |
| `deleteOrder` | DELETE | Delete purchase order by ID |

**Models used in this domain:**
- `Order` - imported from `src/models/base/order/`


### user

**What this domain is about**: Operations about user

**API Class**: `src/api/user/user-api.ts`

**Available Operations:**

| Operation ID | Method | Description |
|--------------|--------|-------------|
| `createUser` | POST | Create user |
| `createUsersWithListInput` | POST | Creates list of users with given input array |
| `loginUser` | GET | Logs user into the system |
| `logoutUser` | GET | Logs out current logged in user session |
| `getUserByName` | GET | Get user by user name |
| `updateUser` | PUT | Update user |
| `deleteUser` | DELETE | Delete user |

**Models used in this domain:**
- `User` - imported from `src/models/base/user/`



## Important Guidelines

### DO NOT

- Modify files in `src/models/base/` - these are auto-generated
- Invent operation IDs that don't exist in the domains above
- Assume model properties not defined in the OpenAPI spec
- Create new API classes outside the domain structure

### DO

- Use the exact operation IDs listed above
- Reference models from `src/models/base/` for type definitions
- Extend functionality in `src/models/core/` or `src/models/custom/` if needed
- Check `src/api/{domain}/{domain}-api.ts` for available methods

## User Disambiguation Notes

<!-- Add project-specific clarifications below -->

(No disambiguation notes added yet. Run with --interactive to add notes.)


---

*This file was generated using `amasdk-update-sdk-context`. Re-run after SDK regeneration to update domains.*
