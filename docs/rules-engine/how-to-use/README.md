# Rules engine - Integration

## Introduction
Learn how to integrate the [Otter Rules Engine](https://www.npmjs.com/package/@o3r/rules-engine) inside your Angular
application.<br>
In this page, you will not find descriptions of the different concepts of the Rules Engine. If a concept seems a 
bit confusing, please refer to the [Rules Engine Introduction](../README.md).

Pre-requisites:
- an Otter-based application
- [@o3r/rules-engine installed](https://www.npmjs.com/package/@o3r/rules-engine#how-to-install)

> [!INFO]
> You can find a live example on a rules engine integration in the [Otter showcase](https://amadeusitgroup.github.io/otter/#/rules-engine)
> with references to the implementation code. Do not hesitate to explore the demo and its [implementation code](https://github.com/AmadeusITGroup/otter/tree/main/apps/showcase)
> to get a better understanding of the rules engine capabilities.
> 
> Here, we will go step by step to provide you with a better understanding of the implementation.

## How to integrate the rules engine in your application

### Use case
Let's integrate the showcase ruleset in an application. We assume the pre-requisites are met.

As a first use case, we keep it simple.
We will consider only the first rule of the [showcase rulesets](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/assets/rules/rulesets.json#L4).

In this rule, if the user selects a date during the summer, New-York will be added in the list of destinations.
![Otter showcase](../../../.attachments/screenshots/showcase/nested-rule-standard-form.png)

This Ruleset only makes reference to an action already provided by the Otter framework.
For this example, let's consider the `outboundDate` fact in the [Otter showcase fact folder](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/facts/trip/trip.facts.ts#L23) and the 
`UPDATE_CONFIG` action provided in the `@o3r/configuration` package and the `duringSummer` operator defined in the [Otter showcase operator folder](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/operators/during-summer/during-summer.operator.ts#L6).

Look into the [Going Further](#going-further) section to look for more complex and optimized use cases.

### Step 1: Integrate the service

First, the `RulesEngineRunnerModule` should be imported in your application module (see [showcase application configuration](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/app/app.module.ts#L102)).

The runner is the core of the rules engine. This is where all the Rulesets will be processed to identify the resulting actions. 

[//]: # (This import should be done automatically with the `ng add @o3r/rules-engine` command - This should be fixed by https://github.com/AmadeusITGroup/otter/issues/1789)

### Step 2: Register the action handlers in the runner

The result of the rules engine is a set of actions applied at the runtime of the application.

The engine is agnostic of the implementation of the different actions in your Rulesets. It allows for extensibility and
a better tree shaking as you will not import useless code to handle actions you do not need.

This means that you will have to explicitly import the action handling modules and register them inside the rules engine.

You will not find the Otter actions in the `@o3r/rules-engine` package but in the ones of the feature they impact:  
- `UPDATE_ASSET`: requires the import of `AssetRulesEngineActionModule` from [@o3r/dynamic-content](https://www.npmjs.com/package/@o3r/dynamic-content/)
- `UPDATE_LOCALISATION`: requires the import of `LocalizationRulesEngineActionModule` from [@o3r/localization](https://www.npmjs.com/package/@o3r/localization/)
- `UPDATE_CONFIG`: requires the import of `ConfigurationRulesEngineActionModule` from [@o3r/configuration](https://www.npmjs.com/package/@o3r/configuration/)
- `UPDATE_PLACEHOLDER`: requires the import of `PlaceholderRulesEngineActionModule` and `PlaceholderRequestStoreModule` from [@o3r/components](https://github.com/AmadeusITGroup/otter/blob/main/packages/%40o3r/components/)

Once the modules have been imported by the application, they need to be explicitly registered into the Rules Engine in the
pages where they will be used. For instance, in the showcase, this is done in the [rules engine page component](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/app/rules-engine/rules-engine.component.ts#L96),  

Note that in the 'New-York availability in summer rule', we only need to register the `UPDATE_CONFIG` action.

> [!WARNING]
> In case the Rules Engine results in an unregistered action, a warning will be raised. You will be able to access it
> thanks to the [rules engine debug tools](#how-to-debug-your-application).

### Step 3: Integrate your facts

Now that the rules engine recognizes the `UPDATE_CONFIG` action, it needs to recognize the `outboundDate` [fact](../README.md#fact)
which should emit values when the outboundDate changes.

In the Otter showcase, this fact is exposed by the `tripFactService`.
Look into the [Going Further](#going-further) section to find out how to create your own fact.

As with actions, the rules engine is not aware of the facts that will be used in the Ruleset. This is not only because
listening and processing useless facts might impact the performance of the rules engine, but also that facts are 
generally business oriented, and thus they cannot be built-in the framework.

Hence, you will need to explicitly register your fact. Again, in the showcase, this is done in the [rules engine page component](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/app/rules-engine/rules-engine.component.ts#L101).

Thanks to this, the application is now ready to retrieve and evaluate the rules and execute the resulting actions.

> [!NOTE]
> There are no constraints on whether to register facts before setting up the Rulesets. The ruleset using them will just
> fail until the facts are available. Once the fact becomes available, a new evaluation of the Ruleset will be triggerred.

### Step 4 (optional): Register your custom operator

As we rely on a custom `duringSummer` operator, it also needs to be registered in the rules engine (see showcase rules engine implementation)[https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/app/rules-engine/rules-engine.component.ts#L99].

### Step 4: Register your Rulesets

The last step is quite simple, just retrieve your JSON file with all the Rulesets you want to run and set them up in
the rule engine runner (see [showcase example](https://github.com/AmadeusITGroup/otter/blob/main/apps/showcase/src/app/rules-engine/rules-engine.component.ts#L124)).

## Going further

### How to debug your application

To help you set up your rules engine, the Otter team provides different tools:
* __Chrome extension__: a user-friendly tool that will display in visual fashion the state of your Rulesets and their 
executions. More details in the [Chrome extension rules engine](./chrome-extension.md) documentation.
* Console devtools: in case you can't or don't want to install a Chrome extension, you can still enable a console debugging 
tool:
```typescript
import {inject, runInInjectionContext} from '@angular/core';
import {OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, RulesEngineRunnerModule, RulesEngineDevtoolsModule, RulesEngineDevtoolsConsoleService} from '@o3r/rules-engine';
import {AppComponent} from './app.component';

bootstrapApplication(AppComponent, {
  imports: [
    RulesEngineDevtoolsModule,
    RulesEngineRunnerModule.forRoot({debug: true}) // Activate rule engine debug mode
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    {provide: OTTER_RULES_ENGINE_DEVTOOLS_OPTIONS, useValue: {isActivatedOnBootstrap: true}}
  ]
})
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      inject(RulesEngineDevtoolsConsoleService);
    });
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));

```

In debug mode, the rules engine exposes methods to get the latest run and status of each Ruleset and the actions 
enabled:
```typescript
// Get the list of active rulesets
_OTTER_DEVTOOLS_.rulesEngine.getActiveRulesets();
// Get the list of output actions, temporary facts, fact triggers and rules for a Ruleset
_OTTER_DEVTOOLS_.rulesEngine.getRulesetExecutions(rulesetId);
// Get all the actions currently applied
_OTTER_DEVTOOLS_.rulesEngine.getAllOutputActions();
```

### How to industrialize your Ruleset generation

If you don't want to generate and maintain your Ruleset JSON file manually, you might want to build a UI that will do it
for you. For this use case, you will need Metadata files with the list of supported operators, facts and the actions
that can be processed on your application (configurations, placeholders, translations etc.).

You can find more information on how to industrialize your Ruleset generation in the [dedicated documentation](./industrialize-ruleset-generation.md).

### How to extend the rules engine with custom actions, operators and facts

If the Otter rules engine comes with built-in actions, operators and one integrated fact, you will need your own custom
facts and maybe add your own custom operators and actions.

Check out the dedicated sections:
* [Create custom facts](./custom-fact.md)
* [Create custom operators](./custom-operator.md)
* [Create custom action](./custom-action.md)

### How to measure your Ruleset performances

If you want to measure the performance of your Rulesets, the Otter rules engine exposes a set of metrics.
Learn more about them in the [performance documentation](./performance-metrics.md).

### Examples of classic Rulesets

Check out some classic examples to build your first Ruleset:
* [Basic Ruleset](../examples/basic-rule.md)
* [Input fact as a complex object](../examples/complex-fact.md)
* [Rules with nested conditions](../examples/nested-conditions.md)

### Complex Rulesets 

#### Runtime facts

An action can result in the update of a runtime variable scoped within the Ruleset. Other rules of the same Ruleset can
then make reference to the runtime variable.

This can lead to factorization as it is then possible to use runtime facts as a way to represent a complex condition tree.
You can find an example of this feature in the [runtime fact documentation](../examples/runtime-facts.md).

#### Implicit built-in facts - the case of dateInNextMinutes and dateNotInNextMinutes

While it is the norm and recommendation to keep the operators of rules [pure](https://en.wikipedia.org/wiki/Pure_function),
there might be cases where a pure operator does not make any sense.

This is the case of `dateInNextMinutes` and `dateNotInNextMinutes`.

In those use cases, the reference to a current time fact is implicit and a current time fact cannot really be used as an
explicit parameter.
For this reason, the Otter framework introduces the concept of implicit 'built-in' facts.

Check out how to integrate those operators and override the default implicit fact behavior in the 
[built-in fact documentation](./built-in-facts.md).

#### How to enable ruleset only when the affected components is present

If your Ruleset only affects a component to modify its configuration or one of its translation key, you won't need it to
run on pages where this component is missing. You can restrict the evaluation of your Ruleset to only pages with your
component thanks to the `linkedComponents` property and improve the performances of your application.

Check out the [linkedComponents documentation](./dedicated-component-ruleset.md).

#### How to use query facts

You can also base your rules on the parameters of your application to deliver different user experiences depending on
deeplinks.

For example, you could leverage this to do A/B testing by sending a parameter which can take different values and by creating
rules based on this parameter's values.

As this use case heavily relies on the integration with other websites, it is preferable to avoid shipping a new version
of your application everytime you want to use a new parameter.

One way to answer all these requirements is to use `portalFacts`.

Check out how to implement them in the [portal facts documentation](../examples/portal-facts.md).

