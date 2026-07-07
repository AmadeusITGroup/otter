# Get release notes

Get the minor release notes for the configured repository.

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
    uriPrefix: 'o3r' // By default it will use what is provided in `repo`
    toolName: 'custom-tool-name',
    toolDescription: 'Custom tool description',
    toolTitle: 'Custom tool title',
    logger: customLogger,
    logLevel: 'error' // default: info
  }
)
```
