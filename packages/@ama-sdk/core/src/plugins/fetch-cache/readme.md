## Fetch Cache

Plugin to set the cache option of the fetch API for every request it is applied to.

For older browsers relying on a polyfill that does not support the fetch 'cache' option, you can:

- specify the content of the 'cache-control' header, which will also add a 'pragma' header in case of 'no-cache'
- specify if the plug-in should add those headers or not. Defaults to checking the presence of the 'whatwg-fetch' polyfill.

### Type of plugins

- Request plugin: [FetchCacheRequest](./fetch-cache.request.ts);
