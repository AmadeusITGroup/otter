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
    cacheFilePath: 'custom/path/for/the/cache.json', // default: .cache/@ama-mcp/repos-using-<library-name>.json
    cacheEntryExpireAfterDays: 90, // To be specified in day
    prettifyCacheFile: true, // default: false
    disableCache: true, // default: false
    toolName: 'custom-tool-name',
    toolDescription: 'Custom tool description',
    toolTitle: 'Custom tool title',
    logger: customLogger,
    logLevel: 'error' // default: info
  }
)
```
