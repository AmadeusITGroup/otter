---
name: create-openapi-project
description: Create a new OpenAPI specification project using npm create @ama-openapi with predefined structure and configuration. Use when user wants to scaffold a new OpenAPI project.
disable-model-invocation: true
---

# Create OpenAPI Project

Creates a new OpenAPI specification project with predefined structure and configuration.

## Usage

When the user wants to create a new OpenAPI project, this skill provides the command to initialize it using the Amadeus OpenAPI tooling.

## Process

1. **Validate Project Name**
   - Convert to lowercase
   - Replace spaces with hyphens
   - Ensure it follows npm package naming conventions (lowercase letters, numbers, hyphens, optional scope)

2. **Provide Creation Command**
   - Return the npm create command to be run with the validated project name

3. **Run NPM Create Command**
   - Run the command `npm create @ama-openapi <project-name>` to scaffold the new OpenAPI project

## Example

User: "Create a new OpenAPI project called flight-booking"

Response:
```
To create a new OpenAPI project named "flight-booking", run:

npm create @ama-openapi flight-booking
```

## Project Name Requirements

- Must be a valid npm package name
- Lowercase letters, numbers, and hyphens only
- Can optionally include a scope (e.g., @myorg/project-name)
- Cannot be empty

## Next Steps After Creation

After running the creation command, the user should:
1. Navigate into the project directory
2. Install dependencies (if not done automatically)
3. Review the generated structure
4. Start defining OpenAPI models in the appropriate directories
