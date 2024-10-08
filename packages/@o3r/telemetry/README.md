<h1 align="center">Otter telemetry</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/telemetry?style=for-the-badge)](https://www.npmjs.com/package/@o3r/telemetry)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/telemetry?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/telemetry)

A set of helpers to retrieve tool usage metrics.

## Privacy notice

https://github.com/AmadeusITGroup/otter/blob/main/docs/telemetry/PRIVACY_NOTICE.md

## Additional information

By default, the project name sent will be the `name` of the `package.json`. It can be overridden by providing `config.o3r.telemetry.projectName`.

Example:
```json5
{
  "name": "app-name",
  ...
  "config": {
    "o3r": {
      "telemetry": {
        "projectName": "app-name-override"
      }
    }
  }
}
