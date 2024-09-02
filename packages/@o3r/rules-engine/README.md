<h1 align="center">Otter rules-engine</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

This package is an [Otter Framework Module](https://github.com/AmadeusITGroup/otter/tree/main/docs/core/MODULE.md).
<br />
<br />

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/rules-engine?style=for-the-badge)](https://www.npmjs.com/package/@o3r/rules-engine)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/rules-engine?color=green&style=for-the-badge)](https://www.npmjs.com/package/@o3r/rules-engine)

This module provides a rules engine that can run on your user's browser to customize the ([translations](https://www.npmjs.com/package/@o3r/localization),
[//]: # (Should we target placeholder or the component npmjs, and we add a section on the placeholder there?)
[placeholders](https://github.com/AmadeusITGroup/otter/blob/main/docs/components/PLACEHOLDERS.md) and [configurations](https://www.npmjs.com/package/@o3r/configuration)) of your application at runtime.

The rules engine interprets a list of [actions](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/README.md#action) to execute based on the evaluation of [Rulesets](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/README.md#ruleset) 
and their conditions. Conditions are logical expressions relying on [operators](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/README.md#operator) and variables we call 
[facts](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/README.md#fact).

You can store your list of Rulesets on a static JSON file.

This mechanism allows you to bring UI personalization based on runtime events without the need of a backend service.
This can be useful if you want to drive dynamic behavior.

For example, you could consider leveraging this feature to display assets based on the current season or for some special events, or to drive
A/B testing on your components.

You will find more information on the concepts behind the rules engine in its [dedicated documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/README.md).
For a demonstration of the rules engine capabilities, you can refer to the [live example](https://amadeusitgroup.github.io/otter/#/rules-engine) 
in the Otter showcase.

## How to install

```shell
ng add @o3r/rules-engine
```

> [!WARNING]
> This module requires [@o3r/core](https://www.npmjs.com/package/@o3r/core) to be installed.

## How to use

The package exposes the ``RulesEngineRunnerService`` that can drive all the Otter customization-based services
in order to personalize the user experience. 
On its own, the service will do nothing and will need __action handlers__ to register with the list of supported actions
and their implementation.

Not only this allows for a better extensibility of the service, but it also keeps the number of imported module to the
bare minimum for a lighter application.

Find more information on the [Otter rules engine documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/how-to-use/README.md).

## Examples

Several examples of the rules engine usage are available on the following links:

- [Basic rule](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/examples/basic-rule.md)
- [Rule with complex fact](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/examples/complex-fact.md)
- [Rule with custom operator](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/examples/custom-operator.md)
- [Rule with Nested Conditions](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/examples/nested-conditions.md)
- [Rule using runtime facts](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/examples/runtime-facts.md)

## Generators

Otter framework provides a set of code generators based on [Angular schematics](https://angular.io/guide/schematics).

| Schematics                | Description                                                   | How to use                       |
|---------------------------|---------------------------------------------------------------|----------------------------------|
| add                       | Include Otter rules-engine module in a library / application. | `ng add @o3r/rules-engine`       |
| rules-engine-to-component | Add rules-engine to an Otter component                        | `ng g rules-engine-to-component` |
| facts-service             | Generate a facts service                                      | `ng g facts-service`             |
| operators                 | Generate an operator                                          | `ng g operator`                  |

## Debug
A whole section of the [Otter Chrome Devtool extension](https://chromewebstore.google.com/detail/otter-devtools/aejabgendbpckkdnjaphhlifbhepmbne) is dedicated to the debug of the rules engine with
a visual representation of your Rulesets and a history of the run, conditions met and actions applied.

Find more information on the tool in the [Otter Chrome Devtool extension documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/dev-tools/chrome-devtools.md) 
and its [dedicated section in the rules engine documentation](https://github.com/AmadeusITGroup/otter/blob/main/docs/rules-engine/how-to-use/chrome-extension.md).

## External links

More details regarding the way the rules engine is working can be found in the [documentation](https://github.com/AmadeusITGroup/otter/tree/main/docs/rules-engine/).<br>
A live example is available in the [Otter Showcase Application](https://amadeusitgroup.github.io/otter/#/rules-engine) with reference to its code source.
