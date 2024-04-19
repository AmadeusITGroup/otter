# A/B Testing
## Introduction
In this page, we will help you integrate an A/B testing solution to the rest of your application.
Let's first define a core concept of A/B testing: an ``experiment`` is a behavior specific to a group of users
-- for instance the display of a banner or a configuration to drive a UI component.

In its [@o3r/third-party](https://www.npmjs.com/package/@o3r/third-party package, the Otter framework exposes a technical
bridge to allow third party scripts to drive experiments on your application.

## Mechanism
The ``AbTestBridge`` is a generic class that can support multiple experiment types to fit your
needs (string, object etc.). The ``AbTestBridge`` exposes two methods to manage the list of experiments to apply on the
application: ``window.start`` and ``window.stop``.

The ``start(experiment: T | T[])`` method requests the application to run one or several experiments, the ``stop(experiment: T | T[])`` method will
remove one or several experiments from the list of experiments while ``stop()`` will stop all the ongoing experiments.

The list of the requested experiments is exposed via ``experiments$`` a public ``Observable`` matching your type.
As the experiment type is generic, you need to pass an equality method reflecting your type to identify an already registered
experiment (stop and avoid duplicate).

```typescript
// Application js
type MyType = { id: string, someExtraProperty: object };
const isEqual = (a?: MyType, b?: MyType) => a?.id === b?.id;
const myBridge = new AbTestBridge<MyType>(isEqual);

myBridge.experiments$.subscribe(doSomethingWithExperiments);

// external js
window.abTestBridge.start({id: 'MyExp'});
// myBridge.experiments$ will emit [{id: 'MyExp'}]
window.abTestBridge.start([{id: 'MyExp2'}, {id: 'A'}, {id: 'B'}, {id: 'C'}]);
// myBridge.experiments$ will emit [{id: 'MyExp'},[{id: 'MyExp2'}, {id: 'A'}, {id: 'B'}, {id: 'C'}]
window.abTestBridge.stop([{id: 'A'}, {id: 'B'}]);
// myBridge.experiments$ will emit [{id: 'MyExp1'}, {id: 'MyExp2'}, {id: 'C'}]
window.abTestBridge.stop({id: 'C'});
// myBridge.experiments$ will emit [{id: 'MyExp1'}, {id: 'MyExp2'}]
window.abTestBridge.stop();
// myBridge.experiments$ will emit []
```
## Integration
``experiments$`` can be used as an input of your frontend rulesets, to share analytics based on your experiment, to drive
your css behavior etc. Let's see how we can do it.

### Experiment-driven rules
You can use the ``experiments$`` stream as an input in your rules engine to drive your user experience.
To do so, you will need to link a rules engine fact to the list of ongoing experiments.

#### The 'experiments' fact
First, you create a fact that will reflect the ongoing experiments. Let's call it ``experiments``.
```typescript
import type {
  FactDefinitions,
} from '@o3r/rules-engine';

export interface ExperimentFacts extends FactDefinitions {
  /**
   * List of AB profile to apply
   */
  experiments: string[];
}
```

Now you need to expose it to the [rules engine](../rules-engine/how-it-works.md) via a service:
```typescript
import {
  Injectable,
} from '@angular/core';
import {
  FactsService,
  RulesEngineService,
} from '@o3r/rules-engine';
import type {
  ExperimentFacts,
} from './experiment.facts';
import {BehaviorSubject} from 'rxjs';

/**
 * An implementation of a service to populate the experiment fact.
 */
@Injectable({
  providedIn: 'root'
})
export class ExperimentFactsService extends FactsService<ExperimentFacts> {
  /** @inheritDoc */
  public facts = {
    experiments: new BehaviorSubject<string[]>([])
  };

  /**
   * Emit a new list of experiments to re-evaluate the rulesets
   *
   * @param experiments: new list of experiments to apply. It will override the previous one
   */
  public setExperiments(experiments: {id: string; variationId: string}[]) {
    this.facts.experiments.next(
      experiments.map(({id, variationId}) => `${id}/${variationId}`)
    );
  }
}
```
**Warning** Your service must be imported only once in the application. A good way to do it is to provide it in root as
a singleton.

#### The A/B Testing service
Now, you need to link ``ExperimentFactsService`` and the ``AbTestBridge`` to update the ``experiments`` fact that reflects the
``experiments$`` object. This service will subscribe to the stream and apply the changes you want.

```typescript
import {
  ABTestingExperiment,
  isExperimentEqual
} from './experiment.interface';
import {
  Injectable,
} from '@angular/core';
import {
  Store,
} from '@ngrx/store';
import {
  ExperimentFactsService,
} from './facts';
import {
  AbTestBridge, AbTestBridgeConfig,
} from '@o3r/third-party';
import {
    LoggerService
} from '@o3r/logger';

/**
 * Centralized service to process the latest experiment list from the A/B test third party.
 * It can lead to ruleset re-evaluation, styling and analytic updates to test and track experimental features.
 */
@Injectable({
  providedIn: 'root'
})
export class AbTestService {
  private bridge: AbTestBridge<ABTestingExperiment>;

  /**
   * @param experimentFacts Service to drive the rule engine facts associated to the A/B testing experiments
   * @param logger Service to handle multiple logger client
   */
  constructor(
    private experimentFacts: ExperimentFactsService,
    private logger: LoggerService
  ) {
    this.log('Instantiate AB test service');
  }

  /**
   * Initialize facts and set up the bridge to communicate with A/B test scripts.
   * @param config
   */
  public register(config?: Partial<AbTestBridgeConfig>) {
    this.experimentFacts.register();
    this.bridge = new AbTestBridge(isExperimentEqual, {logger: this.logger, ...config});
    this.bridge.experiments$.subscribe((profiles: ABTestingExperiment[]) => {
      this.log('apply experiment', experiments);
      this.applyExperimentRules(profiles);
      this.applyExperiment(profiles);
    })
  }

  /**
   * Update experiment fact in rule engine
   *
   * @param experiments
   */
  protected applyExperimentRules(experiments: ABTestingExperiment[]) {
    this.experimentFacts.setExperiments(experiments);
  }

  /**
   * Apply experiment extra - set analytics to track your results, load a new styleshit etc.
   *
   * @param experiments
   */
  protected applyExperiment(experiments: ABTestingExperiment[] | undefined) {
    // Apply some extra logic, set your analytics, load a new stylesheet etc.
  }

  /**
   * Use logger service to log different informations
   *
   * @param args
   */
  private log(...args: any[]) {
    this.logger.log('A/B Test', ...args);
  }
}
```

After registering this service in your application, you will have integrated your AB testing bridge in your application.

You can now create A/B testing-driven rulesets .
```json
{
  "rulesets": [
    {
      "id": "1",
      "name": "AB testing rule",
      "linkedComponents": {
        "or": [
          {
            "library": "@my/lib",
            "name": "ABTestingComponent"
          }
        ]
      },
      "rules": [
        {
          "name": "A/B Test - Update configuration ",
          "inputRuntimeFacts": [],
          "inputFacts": [ "experiments" ],
          "outputRuntimeFacts": [],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "any": [
                {
                  "lhs": {
                    "type": "FACT",
                    "value": "experiments"
                  },
                  "operator": "arrayContains",
                  "rhs": {
                    "type": "LITERAL",
                    "value": "myExperimentId/1"
                  }
                }
              ]
            },
            "successElements": [
              {
                "elementType": "ACTION",
                "actionType": "UPDATE_CONFIG",
                "library": "@mylib/components",
                "component": "MyComponent",
                "property": "nbOfElementToDisplay",
                "value": "1"
              }
            ],
            "failureElements": [
              {
                "elementType": "ACTION",
                "actionType": "UPDATE_CONFIG",
                "library": "@mylib/components",
                "component": "MyComponent",
                "property": "nbOfElementToDisplay",
                "value": "2"
              }
            ]
          }
        }
      ]
    }
  ]
}

```
> Note: In v10 and previously, we used `linkedComponent` property to activate a ruleset on demand. This becomes deprecated and will be removed in v12. Use `linkedComponents` instead;

