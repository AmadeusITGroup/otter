# Renovate Presets

The Otter library provides a set of custom [Renovate Presets](https://docs.renovatebot.com/config-presets/) to facilitate the configuration of automated dependency updates.

## Usage

To be able to benefit from the Renovate Presets exposed by the Otter Framework, you can add the configurations in the `extends` field in your `.renovaterc.json` file as described in the following example:

```json5
{
  "extends": [
    "github>AmadeusITGroup/otter//tools/renovate/base",
    "github>AmadeusITGroup/otter//tools/renovate/otter-project"
  ],
  "packageRules": [
    // ...
  ]
}
```

> [!NOTE]
> The Otter Renovate presets are always prefixed with `github>AmadeusITGroup/otter//tools/renovate/` to target the specific configuration files hosted in the Otter repository.

> [!WARNING]
> Check out the [Self-Hosted Renovate section](#self-hosted-renovate) to see how to fully benefit from the presets.

## Available presets

You can have a look at [the documentation of the available presets](https://github.com/AmadeusITGroup/otter/tree/main/tools/renovate).

## Self-Hosted Renovate

If you need more control on the way renovate bot is run, then you can [self-host your renovate bot](https://docs.renovatebot.com/getting-started/running/#self-hosting-renovate), 
which means that you are managing your own renovate bot, either at repository level or at organization level.
Instead of using the default GitHub App from Renovate, you'll need to create your own or to create a workflow to run it.
The workflow can be as simple as a cron running `npx renovate`.

### Post upgrade commands

The Otter presets come with post upgrade commands to help the upgrade process by running migration scripts or regenerating the SDK for example.
This feature can only work if these commands are whitelisted.
Unfortunately, as of today, whitelisting of post upgrade commands is only possible when using a Self-Hosted Renovate.

Whitelisting these commands has to be done in the Renovate bot configuration file. This file can be located inside or outside your repository.
For example, it can be located in a dedicated `<org>/renovate-bot` repository if it is managed at organization level.

> [!WARNING]
> The Renovate bot configuration is not to be confused with the Renovate repository configuration:
> - The bot configuration controls the way the bot is run, for all the repositories that are scanned.
> - The repository configuration only applies to the current repository.

You need to add the following field to your renovate bot config in order to support the Otter presets:
```json5
// ...
"allowedPostUpgradeCommands": [
  // Used to execute post-install scripts (like version-harmonize)
  "^(npm|yarn) (ci|install)$",

  // Used to execute the migration scripts
  "^(npm|yarn) (run|exec) ng update[a-zA-Z0-9.= {}()#@'\/-]*$",

  // Used to regenerate the SDK
  "^(npm|yarn) run spec:upgrade$",

  // Used to execute the migration scripts of ama-sdk
  "^(npm|yarn) exec schematics @ama-sdk\/schematics:migrate[a-zA-Z0-9.= {}()#'\/-]*$",

  // Used for yarn upgrade when using PnP
  "^yarn dlx @yarnpkg/sdks$"
]
```

### Complex case with private registries

If some of your dependencies are coming from a private registry, you will have to add the token in the `.npmrc` or `.yarnrc.yml` to be able to fetch the new versions and trigger the install in the post-upgrade commands from the presets.
However, it is not recommended to put the tokens directly in the code of your repository, instead you should use secrets in your CI.

A solution can be to set up the authentication at user level in the CI (`~/.npmrc`).
This is only working when running `npx renovate` directly (instead of using the GitHub action which relies on docker images).

Example of setup with npm:

Assuming you created the following secrets in your repository:
- `PRIVATE_REGISTRY_READ_TOKEN` that will contain a valid read-only token to access your private registry.
- `RENOVATE_GITHUB_TOKEN` that will contain a valid write token to access your repository to create the pull-requests.

```yaml
# .github/workflows/renovate.yaml
name: Self-Hosted Renovate

on:
  workflow_dispatch:
  schedule:
    - cron: '0 2 * * *'
env:
  PRIVATE_REGISTRY_READ_TOKEN: ${{ secrets.PRIVATE_REGISTRY_READ_TOKEN }}

jobs:
  renovate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332 # v4.1.7
      - uses: actions/setup-node@0a44ba7841725637a19e28fa30b79a866c81b0a6 # v4.0.4
        with:
          node-version: 22
      - name: Prepare global npmrc for renovate
        shell: 'bash'
        run: 'cat .npmrc.ci > ~/.npmrc'
      - name: 'Running Renovate'
        run: |
          git config --global user.email 'bot@renovateapp.com'
          git config --global user.name 'Renovate Bot'
          git config --global core.longpaths true
          cd .github/workflows && npx renovate@~37.420.1
        env:
          RENOVATE_TOKEN: ${{ secrets.RENOVATE_GITHUB_TOKEN }}
          GITHUB_COM_TOKEN: ${{ secrets.RENOVATE_GITHUB_TOKEN }}
          PRIVATE_REGISTRY_READ_TOKEN: ${{ secrets.PRIVATE_REGISTRY_READ_TOKEN }}
```

```js
// .github/workflows/config.js
module.exports = {
  gitAuthor: 'Renovate Bot <bot@renovateapp.com>',
  platform: 'github',
  repositories: [
    // List of repositories to scan
    // ...
  ],
  customEnvVariables: {
    // This might be needed depending on your setup (when running in Azure for example or using a docker image)
    CI: 'true',

    // This is used in the `.npmrc-ci` file that we copy at user level
    // This is necessary for the install in post-upgrade commands
    PRIVATE_REGISTRY_READ_TOKEN: process.env.PRIVATE_REGISTRY_READ_TOKEN
  },
  // Host rules are used by Renovate to scan your private registries
  // see: https://docs.renovatebot.com/configuration-options/#hostrules
  hostRules: [
    {
      hostType: 'npm',
      matchHost: '<url of your private registry>',
      username: atob(process.env.PRIVATE_REGISTRY_READ_TOKEN)?.split(':')[0],
      password: atob(process.env.PRIVATE_REGISTRY_READ_TOKEN)?.split(':')[1]
    }
  ],
  allowedPostUpgradeCommands: [
    // Used to execute post-install scripts (like version-harmonize)
    "^(npm|yarn) (ci|install)$",

    // Used to execute the migration scripts
    "^(npm|yarn) ng update[a-zA-Z0-9.= {}()#@'\/-]*$",

    // Used to regenerate the SDK
    "^(npm|yarn) run spec:upgrade$",

    // Used to execute the migration scripts of ama-sdk
    "^(npm|yarn) exec schematics @ama-sdk\/schematics:migrate[a-zA-Z0-9.= {}()#'\/-]*$",

    // Used for yarn upgrade when using PnP
    "^yarn dlx @yarnpkg/sdks$"
  ]
};
```

```text
//.npmrc.ci
@my-private-scope:registry=<url of your private registry>
//<url of your private registry>:_auth="${PRIVATE_REGISTRY_READ_TOKEN}"
```

> [!NOTE]
> The workflow of the bot doesn't have to be in the same repository as yours, you just need to make sure the GitHub token has the right rights.
