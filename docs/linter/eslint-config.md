# Otter ESLint Configuration

## Otter ESLint Flat Configuration

`@o3r/eslint-config` provides two different ESLint configurations:

- **default** (imported via *@o3r/eslint-config*): Default Otter ESLint configuration used for any JS and TS files.
- **template** (imported via *@o3r/eslint-config/template*): Otter ESLint configuration to be applied to Otter-based Angular templates.

ESLint 9 and 10 are supported. Compatibility wrappers preserve the existing import, import-newlines, prefer-arrow and JSDoc rules on ESLint 10.
Some wrapped plugins still declare peer ranges excluding ESLint 10; strict peer-dependency resolvers may reject those combinations.

Configuration lookup is separate from the configuration format:
- ESLint 9 searches for `eslint.config.*` from the current working directory by default
- ESLint 10+ searches from each linted file's directory. A project-local `eslint.config.*` can therefore take precedence over the workspace configuration in ESLint 10.

To apply a workspace configuration that merges project-local configurations, pass `--config eslint.config.mjs` explicitly to workspace-wide commands such as linting, version harmonization and lint-staged.
This selects the workspace flat configuration in both versions. See the [ESLint configuration lookup documentation](https://eslint.org/docs/latest/use/migrate-to-10.0.0#config-lookup-from-file).

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
