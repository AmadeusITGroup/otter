# Verify that the yarn package extensions versions

This rule checks the `.yarnrc.yml` file to ensure that each version defined in the `packageExtensions` are aligned with the one used in the `package.json` files of the project.

## Prerequisite

The linter is dedicated to YAML files and requires the setup of the [yaml-eslint-parser](https://www.npmjs.com/package/yaml-eslint-parser).

Example of an ESLint flat configuration:

```javascript
import yamlParser from 'yaml-eslint-parser';
import o3rPlugin from '@o3r/eslint-plugin';

export default [
  {
    files: ['yarnrc.y{a,}ml'],
    languageOptions: {
      parser: yamlParser
    },
    plugins: {
      '@o3r': o3rPlugin
    }
    rules: {
      '@o3r/yarnrc-package-extensions-harmonize': 'error'
    }
  }
]
```

Example of an ESLint legacy configuration:

```json
{
  "parser": "yaml-eslint-parser",
  "plugins": [
    "@o3r"
  ],

  "files": [
    "**/.yarnrc.yml"
  ],
  "extends": [
    "@o3r:yarn-recommended"
  ]
}
```

## Options

### dependencyTypesInPackages

List of dependency types to check in the package.json

**Default**: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies']*

**Usage**:

```json
{
  "@o3r/yarnrc-package-extensions-harmonize": [
    "error",
    {
      "dependencyTypesInPackages": ["dependencies", "peerDependencies"]
    }
  ]
}
```

### ignoredDependencies

List of dependencies to ignore.

**Default**: *[]*

**Usage**:

```json
{
  "@o3r/yarnrc-package-extensions-harmonize": [
    "error",
    {
      "ignoredDependencies": ["rxjs", "@angular/*"]
    }
  ]
}
```

### excludePackages

List of package name to ignore when determining the dependencies versions.

**Default**: *[]*

**Usage**:

```json
{
  "@o3r/yarnrc-package-extensions-harmonize": [
    "error",
    {
      "excludePackages": ["@o3r/core"]
    }
  ]
}
```

### yarnrcDependencyTypes

List of package extension types to check in the yarnrc.

**Default**: *['peerDependencies', 'dependencies']*

**Usage**:

```json
{
  "@o3r/yarnrc-package-extensions-harmonize": [
    "error",
    {
      "yarnrcDependencyTypes": ["dependencies"]
    }
  ]
}
```
