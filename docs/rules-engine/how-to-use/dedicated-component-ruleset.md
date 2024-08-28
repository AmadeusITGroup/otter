# Rules engine - Dedicated ruleset for component

The goal of the feature is to create a ruleset that will be executed if and only if it's used. This will improve the performances 
of your application as the rules engine will not be triggered if the facts are updated but your rule has no effect
at the moment -- for instance if it is supposed to change the configuration of a missing component.

To do so, let's introduce the concept of `linkedComponents`. These are the components that will enable or disable the
ruleset they are linked to. This is done in their `ngOnInit` and `ngOnDestroy` methods.

## How to make a Component compatible

You can make a component `linkedComponents` compatible thanks the following Otter CLI command:
`ng g rules-engine-to-component --path=[path-to-my-component-file]`

This command will compute the component's identifier and add the methods to enable or disable the ruleset 
matching the component name.

```diff
import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject, OnInit, OnDestroy} from '@angular/core';
+ import {LinkableToRuleset, RulesEngineRunnerService} from '@o3r/rules-engine';
+ import {computeItemIdentifier} from '@o3r/core';

@O3rComponent({ componentType: 'Component' })
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.template.html',
  styleUrl: './my-component.style.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
- export class MyComponent {
+ export class MyComponent implements OnInit, OnDestroy {
  
+   private readonly rulesEngineService = inject(RulesEngineRunnerService, { optional: true });
+   private readonly componentIdentifier = computeItemIdentifier('MyComponent', '@scope/components');

+   public ngOnInit() {
+     if (this.rulesEngineService) {
+       this.rulesEngineService.enableRuleSetFor(this.componentIdentifier);
+     }
+   }
+   public ngOnDestroy() {
+     if (this.rulesEngineService) {
+       this.rulesEngineService.disableRuleSetFor(this.componentIdentifier);
+     }
+   }
}
```

> [!IMPORTANT]
> If you are managing your ruleset with a dedicated UI, please note that your component should either be a Page, 
> a Block or an ExposedComponent for it to appear in the component metadata file which will make it visible in your UI. 

## How to link a ruleset to a component

Now that your component can trigger or prevent the run of a ruleset, you can set the `linkedComponents` property to 
prevent the execution of the Ruleset until your component is available in the page:

```json5
{
  "rulesets": [
    {
      "id": "e5th46e84-5e4th-54eth65seth46se8th2",
      "name": "the second ruleset",
      "validityRange": {
        // The ruleset will be ignored outside of these dates.
        "from": "09/01/2021",
        "to": "11/01/2025"
      },
      "linkedComponents": {
        // 'or' keyword means: if at least one component from the list is registered, the ruleset is active
        // 'and' keyword is not supported, but you can request it via a new issue (https://github.com/AmadeusITGroup/otter/issues/new?assignees=&labels=enhancement&projects=&template=5-FEATURE-FORM.yaml&title=%5BFeature%5D%3A+),
        // and we will add the support
        "or": [ 
          {
            "library": "@scope/components",
            "name": "MyComponent"
          },
          {
            "library": "@scope/components",
            "name": "MyComponent2"
          }
        ]
      },
      "rules": [
        // ...
      ]
    }
  ]
}
```
> [!INFO]
> In v10 and the previous version, the Otter framework exposed the `linkedComponent` property to activate a ruleset on demand. 
> This is now deprecated and will be removed in v12. Use `linkedComponents` instead.

## How it works

`RulesEngineRunnerService` handles the subscriptions for all the rulesets.
At the initialization of the application, the service listens to a selector to get all the active rulesets that are not linked
to any components and that met the validity date range criteria (described in the `validityRange` property of the ruleset).
Then it will merge the result with the on-demand rulesets -- the rulesets with `linkedComponents` currently activated.

As soon as the component is instantiated on the page, i.e. when `ngOnInit` is called, it will add its ID to the 
list of requested linked rulesets.
`RulesEngineRunnerService` will then add the relevant rulesets in its on-demand list, which will trigger their evaluation.

Once a component is removed from the list of requested rulesets, i.e. that is when `ngOnDestroy` is called, and if 
none of the other components in the page are linked to the ruleset, it will revert to its previous 'disabled' mode.
