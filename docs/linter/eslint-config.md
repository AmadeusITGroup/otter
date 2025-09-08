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

## Warnings

When a rule is set to `warn` in our config, it will be set to `error` on the next major.
