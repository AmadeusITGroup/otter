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

The Otter presets come with post upgrade commands to help the upgrade process by running migration scripts or regenerating the SDK for example.
This feature can only work if these commands are whitelisted.
Unfortunately, as of today, whitelisting of post upgrade commands is only possible when using a [Self-Hosted Renovate](https://docs.renovatebot.com/examples/self-hosting/).

Instead of using the GitHub App Renovate, you'll need to create your own or to create a workflow to run it.
The workflow can be as simple as a cron running `npx renovate`.

You will need the following config in your renovate instance to support the Otter presets:
```javascript
module.exports = {
  // ...
  allowPostUpgradeCommandTemplating: true,
  allowedPostUpgradeCommands: [
    // Used to execute post-install scripts (like version-harmonize)
    "^(npm|yarn) install$",

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
