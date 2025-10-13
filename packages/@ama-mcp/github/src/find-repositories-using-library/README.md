# Find repositories using library

List all repositories that use the configured library's dependencies in their package.json files.

## How to use

```typescript
registerGetRepositoriesUsingLibraryTool(
  mcpServer,
  {
    // Mandatory options
    githubToken: process.env.GITHUB_TOKEN,
    libraryName: 'My Library',
    scopes: ['scope-a', 'scope-b'], // Limited to 10 to avoid hitting GitHub Search API rate limit
    // Optional options
    disableCache: false, // default: false
    cachePath: 'custom/path/for/the/cache.json', // default: .cache/@ama-mcp/repos-using-<library-name>.json
    cacheMaxAge: 90, // To be specified in day
    toolName: 'custom-tool-name',
    toolDescription: 'Custom tool description',
    toolTitle: 'Custom tool title'
  },
  customLogger
)
```
