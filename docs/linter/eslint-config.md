# Otter ESLint Configuration

## Otter ESLint Flat Configuration

`@o3r/eslint-config` provides two different ESLint configurations:

- **default** (imported via *@o3r/eslint-config*): Default Otter ESLint configuration used for any JS and TS files.
- **template** (imported via *@o3r/eslint-config/template*): Otter ESLint configuration to be applied to Otter-based Angular templates.

Example of configuration:
```javascript
import o3rConfig from '@o3r/eslint-config';

export default [
  ...o3rConfig,
  {
    name: 'my-project-rules',
    rules: {
      // ...
    }
  }
];
```


## Otter ESLint Legacy Configuration

> [!WARNING]
> These configurations are deprecated. Please use [FlatConfiguration](#otter-eslint-flat-configuration) instead.

`@o3r/eslint-config-otter` provides three different ESLint configurations:

- **default** (imported via *@o3r/eslint-config-otter*): Default Otter ESLint configuration used for any JS and TS files.
- **template** (imported via *@o3r/eslint-config-otter/template*): Otter ESLint configuration to be applied to Otter-based Angular templates.
- **fast** (imported via *@o3r/eslint-config-otter/fast*): Configuration based on `default` where the most time-consuming rules had been disabled to accelerate the execution.

### Switch from the Default to Fast configuration

It's possible to switch a configuration to another by passing a `global` argument to the ESLint CLI.

Example of configuration:

```javascript
// .eslintrc.js

module.exports = {
  ...,
  'extends': [
    // look for 'fast' in global arguments to use Fast config instead of Default
    process.argv.includes('fast') ? '@o3r/eslint-config-otter/fast' : '@o3r/eslint-config-otter'
  ].map(require.resolve)
};
```

Then the CLI can be called as following:

```shell
yarn eslint --global fast
```

## Warnings

When a rule is set to `warn` in our config, it will be set to `error` on the next major.
