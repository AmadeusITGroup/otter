<h1 align="center">Otter Renovate presets</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

Otter framework provides a set of Renovate presets to facilitate the setup and reduce the boilerplate in your `.renovaterc.json`

> [!WARNING]
> Since Otter v12.3, our presets only support Renovate >= 38
> If you want to use our presets with Renovate < 38,
> you can lock the version of the presets used thanks to the [#vX.Y.Z suffix](https://docs.renovatebot.com/config-presets/#preset-hosting).

## Available presets

| Preset                                  | Parameters                                                     | Description                                                                                        |
| --------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **group/design-factory**                |                                                                | Group the dependencies related to Design Factory                                                   |
| **group/otter**                         |                                                                | Group the dependencies related to Otter                                                            |
| **group/sdk-spec**                      | spec-package-name                                              | Create a dedicated group for the SDK spec (when fetching the spec from an NPM repository)          |
| **group/angular**                       |                                                                | Group all Angular dependencies                                                                     |
| **group/typescript**                    |                                                                | Group all Typescript dependenciesmanager                                                           |
| **tasks/base**                          | npmrc-path (optional)                                          | Trigger post-install script when upgrading the package manager                                     |
| **tasks/otter-ng-update**               | package-manager, npmrc-path (optional)                         | Trigger the migration scripts when upgrading the Otter dependencies                                |
| **tasks/sdk-regenerate**                | package-manager, npmrc-path (optional)                         | Regenerate the SDK when upgrading the SDK dependencies                                             |
| **tasks/sdk-spec-regenerate**           | package-manager, spec-package-name, npmrc-path (optional)      | Regenerate the SDK when upgrading the SDK spec (when fetching the spec from an NPM repository)     |
| **branching-strategy/release-branches** |                                                                | Rules to reduce impacted updates on release branches                                               |
| **branching-strategy/trunk-based**      |                                                                | Rules to apply on trunk-based development                                                          |
| **tasks/yarn-pnp**                      |                                                                | **(Yarn only)** Upgrade Yarn SDKs when upgrading the version of Yarn (only relevant with PnP)      |
| **base**                                |                                                                | Base configuration recommended for any project                                                     |
| **otter-project**                       | npmrc-path (optional)                                          | **(Yarn only)** Additional configuration recommended for an Otter-based project                    |
| **sdk**                                 | npmrc-path (optional)                                          | **(Yarn only)** Additional configuration recommended for an SDK project                            |
| **sdk-spec-upgrade**                    | spec-package-name, npmrc-path (optional)                       | **(Yarn only)** Additional configuration recommended when fetching the spec from an NPM repository |

## Recommended setup

### Otter monorepo

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/otter-project"
  ]
}
```

If you are using npm package manager instead of yarn:

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/group/otter",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/base",
    "github>AmadeusITGroup/otter//tools/renovate/branching-strategy/release-branches",
    // or "github>AmadeusITGroup/otter//tools/renovate/branching-strategy/trunk-based" if your repo is based on Trunk-based Development
    "github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update(npm)",
    "github>AmadeusITGroup/otter//tools/renovate/managers/renovate-otter-presets.json5"
  ]
}
```

> [!IMPORTANT]
> We encourage you to lock the version of the presets used thanks to the [#vX.Y.Z suffix](https://docs.renovatebot.com/config-presets/#preset-hosting).
> This version will be upgrading with Otter by the Presets `otter-project` or via `"github>AmadeusITGroup/otter//tools/renovate/managers/renovate-otter-presets.json5"` directly.

## Otter SDK

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/sdk"
  ]
}
```

If you are using Renovate to update your swagger spec files:

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/sdk",
    "github>AmadeusITGroup/otter//tools/renovate/sdk-spec-upgrade(@my-spec/super-spec)"
  ]
}
```

If you are using npm package manager instead of yarn:

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/group/otter",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/base",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-regenerate(npm)",
    "github>AmadeusITGroup/otter//tools/renovate/group/sdk-spec(@my-spec/super-spec)",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-spec-regenerate(npm, @my-spec/super-spec)"
  ]
}
```

## Private registry support

If your project uses a private npm registry, the post-upgrade install commands need access to your registry credentials. The approach differs depending on the package manager.

### npm and Yarn 1 (Classic)

Create a dedicated `.npmrc` file (e.g. `.npmrc-renovate`) in your repository with the registry configuration:

```ini
registry=https://your-private-registry.com/
//your-private-registry.com/:_authToken=${NPM_TOKEN}
```

> [!IMPORTANT]
> `NPM_TOKEN` is a conventional variable name agreed upon between the Renovate bot operator and the repository users. It must be provided to the Renovate bot at the platform level (e.g. via [custom environment variables](https://docs.renovatebot.com/self-hosted-configuration/#customenvvariables) for self-hosted, or your CI runner's secret variables). You can use any variable name as long as it matches between the `.npmrc` file and the bot configuration.

Then pass the file path as a parameter to the presets:

**Otter monorepo (Yarn):**

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/group/otter",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/base(.npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/branching-strategy/release-branches",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update(yarn, .npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/managers/renovate-otter-presets.json5"
  ]
}
```

**Otter monorepo (npm):**

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/group/otter",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/base(.npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/branching-strategy/release-branches",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update(npm, .npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/managers/renovate-otter-presets.json5"
  ]
}
```

**SDK project (Yarn):**

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/sdk(.npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/sdk-spec-upgrade(@my-spec/super-spec, .npmrc-renovate)"
  ]
}
```

**SDK project (npm):**

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/group/otter",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/base(.npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-regenerate(npm, .npmrc-renovate)",
    "github>AmadeusITGroup/otter//tools/renovate/group/sdk-spec(@my-spec/super-spec)",
    "github>AmadeusITGroup/otter//tools/renovate/tasks/sdk-spec-regenerate(npm, @my-spec/super-spec, .npmrc-renovate)"
  ]
}
```

This works because the `NPM_CONFIG_USERCONFIG` environment variable is supported by both npm and [Yarn 1 (Classic)](https://classic.yarnpkg.com/en/docs/envvars#npm_config).

> [!NOTE]
> Make sure the `.npmrc-renovate` file is committed to the repository but is excluded from Renovate's file filters (already handled by the presets via `"!**/.{npmrc,yarnrc*}"`).

### Yarn 2+ (Berry)

Yarn Berry does not support `NPM_CONFIG_USERCONFIG`. Instead, configure [`hostRules`](https://docs.renovatebot.com/getting-started/private-packages/#yarn-2) in your Renovate config. Renovate will [automatically update `npmRegistries` in `.yarnrc.yml`](https://docs.renovatebot.com/getting-started/private-packages/#yarn-2) with the resolved credentials before running Yarn.

> [!NOTE]
> **Why not use `hostRules` for npm / Yarn 1 too?**
> Renovate converts `hostRules` into package manager credentials for its own [artifact updating](https://docs.renovatebot.com/getting-started/private-packages/#package-manager-credentials-for-artifact-updating) (lock file regeneration). However, the `postUpgradeTasks` shell commands (e.g. `ng update`, `npm install`) used by our presets run separately and do not automatically receive `hostRules` credentials. For Yarn Berry, Renovate has [built-in support](https://docs.renovatebot.com/getting-started/private-packages/#yarn-2) that writes credentials into `.yarnrc.yml` before any Yarn command runs, so `hostRules` alone is sufficient. For npm and Yarn 1, the equivalent mechanism does not exist — hence the `.npmrc-renovate` + `NPM_CONFIG_USERCONFIG` approach described above.

The `hostRules` can be defined in two places:

- **Bot/platform config** (recommended): The Renovate bot operator defines `hostRules` with the token in the [self-hosted configuration](https://docs.renovatebot.com/self-hosted-configuration/). The token stays secret and is never committed to the repository.
- **Repository config** (`.renovaterc.json`): You can add `hostRules` directly in your repo config, but the token must then be [encrypted](https://docs.renovatebot.com/configuration-options/#encrypted) to avoid exposing it in plain text.

For more details on all available approaches, see the [Renovate private packages documentation](https://docs.renovatebot.com/getting-started/private-packages/).

**Repository config example (with encrypted token):**

```json5
// .renovaterc.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/otter-project"
  ],
  "hostRules": [
    {
      "matchHost": "https://your-private-registry.com/",
      "hostType": "npm",
      "encrypted": {
        "token": "<your-encrypted-token>"
      }
    }
  ]
}
```

> [!TIP]
> If the Renovate bot operator has already configured `hostRules` for your registry at the platform level, you do not need to add anything to your repository config — it will work out of the box.
