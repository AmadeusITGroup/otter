# How to upgrade to a new version of Otter

We recommend using `ng update` command from @angular/cli to perform the update:

```shell
# Upgrade to latest
yarn ng update @o3r/core

# Upgrade to a specific version
yarn ng update @o3r/core@10.0.0-rc.1

# Upgrade to a specific range
yarn ng update @o3r/core@^10
```

Using this command will trigger the update for @o3r packages, @ama-sdk packages and all related dependencies.

Using `ng update` will execute the migration scripts provided by the packages on top of updating the versions in your `package.json`.

This can greatly reduce the effort needed to migrate as some of the updates on your code can be performed automatically.

> [!IMPORTANT]
> The previous command only works in an Angular workspace (you need to have an `angular.json` at the root of your project).

## Special case of monorepo

If you are using a monorepo, you may notice that the previous command only updates the `package.json` at root level.

However, the migration scripts are executed for all the projects.

> [!IMPORTANT]
> It is currently not possible to execute the migration scripts only for one project of your monorepo.
> You have to upgrade all of them to benefit from the scripts

We recommend, setting-up the [version-harmonize](../linter/eslint-plugin/rules/json-dependency-versions-harmonize.md) to make sure the versions are aligned between your projects.

You can easily do so by adding `@o3r/eslint-config-otter` to your repository, this will generate the `eslint` config for you.

```shell
yarn ng add @o3r/eslint-config-otter
```

If you already have an `eslint` config, you can use the version-harmonize rule like this:
```json5
{
  "overrides": [
    {
      "parser": "jsonc-eslint-parser",
      "files": [
        "**/*.json"
      ]
    },
    {
      "files": [
        "**/package.json"
      ],
      "plugins": [
        "@o3r"
      ],
      "rules": {
        "@o3r/json-dependency-versions-harmonize": ["error", {
          "ignoredPackages": [],
          "alignPeerDependencies": false
        }]
      }
    }
  ]
}
```

Once this is set up, you can run the version-harmonize before and after the migration using `yarn eslint **/package.json --fix`.

## Guide to update your Otter version
Although the Otter team always tries to automate the migration steps as much as possible , there may be cases where
automation does not work.

You can always refer to the dedicated [migration guide](../../migration-guides/README.md) of each version to see the list of
changes that needs to be applied.
