<h1 align="center">Otter Renovate presets</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

Otter framework provides a set of Renovate presets to facilitate the setup and reduce the boilerplate in your `.renovaterc.json`

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
    "github>AmadeusITGroup/otter//tools/renovate/tasks/otter-ng-update(npm)"
  ]
}
```

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
