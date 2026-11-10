# Otter ESLint Configuration

## Otter ESLint Flat Configuration

`@o3r/eslint-config` provides two different ESLint configurations:

- **default** (imported via *@o3r/eslint-config*): Default Otter ESLint configuration used for any JS and TS files.
- **template** (imported via *@o3r/eslint-config/template*): Otter ESLint configuration to be applied to Otter-based Angular templates.

ESLint 9 and 10 are supported. Compatibility wrappers preserve the existing import, import-newlines, prefer-arrow and JSDoc rules on ESLint 10.
Some wrapped plugins still declare peer ranges excluding ESLint 10; strict peer-dependency resolvers may reject those combinations.

ESLint 10 looks up configuration from each linted file. To apply a workspace configuration that merges project-local configurations, pass `--config eslint.config.mjs` explicitly to workspace-wide commands.

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

## Warnings

When a rule is set to `warn` in our config, it will be set to `error` on the next major.
