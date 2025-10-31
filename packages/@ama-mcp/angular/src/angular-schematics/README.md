# Angular schematics

List Angular schematics (ng generate) and their basic options.

## How to use

```typescript
registerAngularSchematicsTool(
  mcpServer,
  {
    // Optional option
    cwd: 'custom/path/to/the/folder/containing/the/angular.json', // default: process.cwd()
    toolName: 'custom-tool-name',
    toolDescription: 'Custom tool description',
    toolTitle: 'Custom tool title'
  },
  customLogger
)
```
