# Mock intercept plugin

The mock interception strategy works based on two interceptions: request and fetch. For each interception, a plugin has been made.

The mock mechanism provides, via the `getResponse` function, a way to completely override the fetch response. To apply the mock at FetchAPI level, we provide the `MockInterceptFetch`.
It will work with the `MockInterceptRequest` on the same mock set.

Example of usage:

```typescript
const baseConfig = new ApiFetchClient({
    basePath: 'http://my-api.com',
    requestPlugins: [
      new MockInterceptRequest({
        adapter: myAdapter
      })
    ],
    fetchPlugins: [
      new MockInterceptFetch({
        adapter: myAdapter
      })
    ]
});
```

## References

- [Request Plugin](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40ama-sdk/core/src/plugins/mock-intercept/README.md): full mock mechanism documentation.
