# Rules Engine Example - Portal Facts

## Pre-requisite

This use case applies to applications that are targeted via deeplink (for example, from an email or an external 
application portal).

## Introduction

For this example, we want to reference the data of the deeplink in the Rulesets of the application. For this purpose, the
data will be transferred to the application in the deeplink `portalFacts` parameter.

This feature should be generic. Neither the metadata nor the code of the application should need to be updated to
support new parameters in order to simplify the integration with external applications.

Let's check how to meet these requirements.

## Implementation

### PortalFacts

The deeplink parameters are exposed to the rule engine via a `portalFacts` fact which will emit a map of `<string, string>` with
the different portal parameter names associated to their values.

> [!WARNING]
> `portalFacts` only supports string and no complex value.

The rule will use the `portalFacts` with a JSONPath to select the requested parameter.

Note that, as its content is dynamic, `portalFacts` should not be part of the [metadata of the rules engine](../how-to-use/industrialize-ruleset-generation.md).
To avoid its extraction, it will be part of a dedicated folder. 

You will need to generate a `PortalFactService` in this folder and register it in the application rules engine.
For this purpose, please follow the [custom fact documentation](../how-to-use/custom-fact.md).

This service will expose a fact with the `portalFacts` object sent by the deeplink.

For this use case, we will take the assumption that `portalFacts` is sent as a POST parameter and injected in the
`data-post` property of the `body` tag.

This means that the `https://url-of-my-app` request with the body `{portalFacts:[{"key":"portalFactName1", "value":"portalFactValue2"}]}`
will return this HTML:

```html

<body data-post='{"portalFacts":[{"key":"portalFactName1","value":"portalFactValue2"}]}'>
    ...

</body>
```
 
This way, we can use the Otter `RequestParametersService` ([@o3r/dynamic-content](https://www.npmjs.com/package/@o3r/dynamic-content)) 
to retrieve the object and use it to set up the `portalFacts` map.

```typescript
import {inject, Injectable} from '@angular/core';
import {FactsService, PortalFacts, RulesEngineRunnerService, FactSet} from '@o3r/rules-engine';
import {RequestParametersService} from '@o3r/dynamic-content';
import {of} from 'rxjs';

@Injectable()
export class PortalFactsService extends FactsService<PortalFacts> {

  public facts: FactSet<PortalFacts> = {
    // Ex index.html with data  <body data-post='{"portalFacts":[{"key":"portalFactName1","value":"portalFactValue2"}]}'> </body>
    portalFacts: this.handleRawPortalFacts(inject(RequestParametersService).getPostParameter('portalFacts'))
  };

  constructor(rulesEngine: RulesEngineRunnerService) {
    super(rulesEngine);
  }

  /**
   * Raw format value example: "[{\"key\":\"portalFactName1\",\"value\":\"portalFactValue2\"}]"
   *
   * @param rawPortalFacts
   */
  public handleRawPortalFacts(rawPortalFacts: any) {
    if (!rawPortalFacts) {
      return;
    }
    const portalFactsArray = JSON.parse(rawPortalFacts);
    return portalFactsArray.reduce((acc: PortalFacts, current: { key: string; value: string }) => {

      acc[current.key] = current.value;

      return acc;
    }, {});
  }
}
```

> [!WARNING]
> As mentioned before and because the portal facts are handled in a specific way, the metadata of the rules engine should
> not expose them.
> 
> This means that the `portalFacts` name is a contract. Both the fact and the parameter will exactly match it for this
> feature to work.

### Ruleset

You can reference `portalFacts` as you would reference any other facts: you just need to apply a JSONPath to specify which 
fact you want to access.

A simple example of a condition would be:

```json5
{
  "condition": {
    "lhs": {
      "type": "FACT",
      "value": "portalFacts",
      "path": "$.portalFactName1"
    },
    "operator": "equals",
    "rhs": {
      "type": "LITERAL",
      "value": "portalFactValue1"
    }
  }
}
```
