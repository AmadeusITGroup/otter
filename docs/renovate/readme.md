# Renovate Presets

The Otter library provide a set of [Renovate Presets](https://docs.renovatebot.com/config-presets/) custom to facilitate the configuration of automated dependency updates.

## Usage

To be able to benefice of the Renovate Presets exposed by the Otter Framework, you can add the configurations in the `extends` field in your `.renovaterc.json` file as described in the following example:

```json5
{
  "extends": [
    "config:base"
    "github>kpanot/otter//tools/renovate/base",
    "github>kpanot/otter//tools/renovate/otter-project"
  ],
  "packageRules": [
    // ...
  ]
}
```

> [!NOTE]
> The Otter Renovate presets are always prefixed with `github>kpanot/otter//tools/renovate/` to target the specific configuration files hosted in the Otter repository.

## Available presets

- **base**: Base configuration recommended to an Otter base project.
- **otter-project**: Configuration to used in a project to ensure, facilitate and regroup the upgrades of the Otter dependencies.
- **sdk**: Configuration to ensure the upgrade of the dependencies of a generated SDK
- **sdk-spec-upgrade**: Setup an auto-regeneration of the SDK based on a given Swagger/OAS specification dependency (as first [parameter](https://docs.renovatebot.com/config-presets/#preset-parameters)).
- **design-factory**: Renovate configuration to ensure the dependency upgrade of the Design Factory dependencies are following the Design Factory constraints.
