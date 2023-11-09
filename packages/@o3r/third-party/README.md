<h1 align="center">Otter third-party</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/.attachments/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

This module aims at improving the communication with third parties.
It exposes bridges to integrate third parties iFrame via an established communication protocol.
It also provides support of an A/B Testing solution via shared windows properties 
(more info on the [A/B testing dedicated documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/ab-testing/AB_TESTING.md))

## How to install

```shell
ng add @o3r/third-party
```

> **Warning**: this module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## Generators

Otter framework provides a set of code generators based on [angular schematics](https://angular.io/guide/schematics).

| Schematics            | Description                                                  | How to use                  |
| --------------------- | ------------------------------------------------------------ | --------------------------- |
| add                   | Include Otter third party module in a library / application. | `ng add @o3r/third-party`   |
| iframe-to-component  | Add iframe to an Otter component                             | `ng g iframe-to-component` |
