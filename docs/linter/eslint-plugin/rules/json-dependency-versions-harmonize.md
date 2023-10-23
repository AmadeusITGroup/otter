# Verify that the dependencies are aligned in the monorepos sub packages

This rule checks each `package.json` to ensure that its dependencies are consistent with those defined in other `package.json` files within the workspace.

## Prerequisite

The linter is dedicated to JSON files and requires the setup of the [jsonc-eslint-parser](https://www.npmjs.com/package/jsonc-eslint-parser).

Example of a ESLint configuration:

```json
{
  "parser": "jsonc-eslint-parser",
  "plugins": [
    "@o3r"
  ],
  "extends": [
    "@o3r:recommended-json"
  ]
}
```

## Options

### alignPeerDependencies

Enforce to align the version of the dependencies with the latest range.

**Default**: *false*

**Usage**:

```json
{
  "@o3r/json-dependency-versions-harmonize": [
    "error",
    {
      "alignPeerDependencies": true
    }
  ]
}
```

### dependencyTypes

List of dependency types to update

**Default**: ['optionalDependencies', 'dependencies', 'devDependencies', 'peerDependencies', 'generatorDependencies']*

**Usage**:

```json
{
  "@o3r/json-dependency-versions-harmonize": [
    "error",
    {
      "dependencyTypes": ["dependencies", "peerDependencies"]
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
  "@o3r/json-dependency-versions-harmonize": [
    "error",
    {
      "ignoredDependencies": ["rxjs", "@angular/*"]
    }
  ]
}
```

### ignoredPackages

List of package name to ignore when determining the dependencies versions.

**Default**: *[]*

**Usage**:

```json
{
  "@o3r/json-dependency-versions-harmonize": [
    "error",
    {
      "ignoredPackages": ["@o3r/core"]
    }
  ]
}
```
