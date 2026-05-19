---
name: create-openapi-project
description: Scaffold a new OpenAPI project with predefined structure. Use when user wants to initialize, create, or set up a new OpenAPI specification project from scratch.
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
   - Ensure the project name is not emprty and follows npm package naming conventions

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

## Next Steps After Creation

After running the creation command, the user should:
1. Navigate into the project directory
2. Install dependencies (if not done automatically)
3. Review the generated structure
4. Start defining OpenAPI models in the appropriate directories
