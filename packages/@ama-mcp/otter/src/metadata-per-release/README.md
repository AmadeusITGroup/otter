# Find Otter metadata per application release

Find Otter metadata per application release and register it as resources.

## How to use

```typescript
registerMetadataPerRelease(
  mcpServer,
  {
    // Mandatory options
    retrievePackages: () => ['otter-application-1', 'otter-application-2'],
    retrieveTags: (packageName) => packageName === 'otter-application-1'
      ? ['v1.0.0', 'v1.0.1', 'v2.0.0']
      : ['v1.1.0', 'v2.0.0'],
    fetchPackageArtifact: (packageName, tagName) => fetch(`my-api-to-download-tgz-package/${packageName}/${tagName}`)),
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
