# Rules engine

## Dedicated ruleset for component

### Description

The goal of the feature is to allow to create a ruleset that will be executed if and only if it's used.
To do that we will subscribe in the onInit of the component, to the dedicated ruleset.

## How to add it to your application

First, you need to have a ruleset defined in your json (created via the CMS interface) that will be identified by a unique id, and you need to specify that the ruleSet is linked to at least one component, meaning that it's not executed per default. The json will look as follows :

```json5
{
  "ruleSets": [
    {
      "id": "e5th46e84-5e4th-54eth65seth46se8th2",
      "name": "the second ruleset",
      "linkedComponents": {
        "or": [ // 'or' keyword means: if at least one component from the list is registered, the ruleset is active
          {
            "library": "@scope/components",
            "name": "TestComponent"
          },
          {
            "library": "@scope/components",
            "name": "TestComponent2"
          }
        ]
      },
      "rules": [
        ...
      ]
    }
  ]
}
```
> Note: In v10 and previously, we used `linkedComponent` property to activate a ruleset on demand. This becomes deprecated and will be removed in v12. Use `linkedComponents` instead;

Now that you have the id, you will need to subscribe to the ruleset in your component :

```typescript
import {LinkableToRuleset, RulesEngineRunnerService} from '@o3r/rules-engine';
import {computeItemIdentifier, type ExposedComponent} from '@o3r/core';

export class MyComponent implements LinkableToRuleset, ExposedComponent {

  private readonly componentIdentifier = computeItemIdentifier('@scope/components', 'TestComponent');

  constructor(@Optional() private readonly service: RulesEngineRunnerService) {
  }

  public ngOnInit() {
    this.service?.enableRuleSetFor(componentIdentifier);
  }

  public ngOnDestroy() {
    this.service?.disableRuleSetFor(componentIdentifier);
  }
}
```

Important : Please note that you need your component either to be a Page, Block or an ExposedComponent for it to be extracted in the metadata file and sent to the CMS.

## How does it work

The RulesEngineRunnerService is the one that will handle the default subscriptions.
At the initialization of the application, the ruleset store will provide a selector to get all Active ruleset.
Then this selector will be used to subscribe to those rulesets in the service as an initial behavior.
Our onDemand ruleset will not be part of this initial subscription, that's why as long as no one subscribes to it, it will not be evaluated.
As soon as our component is instantiated on the page (ngOnInit called), it will explicitly subscribe to it, resulting in its evaluation (and refresh if any input facts changes).
Once the subscription is removed (ngOnDestroy) called, and no other component is linked to it, the ruleset will go back to its previous 'disabled' mode.

## Possible use cases

That feature is really convenient when we want to display a component and evaluate a ruleset based optionally on the context.
