# Get supported releases

Get the list of supported releases for the configured repository.

## How to use

```typescript
registerGetRepositoriesUsingLibraryTool(
  mcpServer,
  {
    // Mandatory options
    githubToken: process.env.GITHUB_TOKEN,
    owner: 'AmadeusITGroup'
    repo: 'otter',
    // Optional options
    libraryName: 'My Library',
    toolName: 'custom-tool-name',
    toolDescription: 'Custom tool description',
    toolTitle: 'Custom tool title',
    logger: customLogger,
    logLevel: 'error' // default: info
  }
)
```
