# Rules Engine - Portal Facts

## Introduction

What we call portal facts are the facts that are sent by the portal to the application (for example using post parameters).
Here we will use a map of <string,string> called portalFacts that will contain a mapping between a portal fact name and its value.
No complex value is supported at the moment : only string.
The goal of this map is to be generic: any additional fact added won't require an update in the application to change the metadata.
In the rules the idea is to use a json path to access a specific fact in the portalFacts map.
That means that without any change on the application you can decide to create a new fact in the map and reference it in your application using the json path.

## How to integrate in application

The portalFacts map is not as any other fact : it won't be part of metadata file. We will start creating another folder next to the facts one which will not be referenced in the extractor.
Let's call it app-facts for example.

Inside this folder we will create the portal-facts directory including :
portal.facts.module.ts

```typescript
import {NgModule} from '@angular/core';
import {RulesEngineRunnerModule} from '@o3r/rules-engine';
import {PortalFactsService} from './portal.facts.service';

@NgModule({
  imports: [
    RulesEngineRunnerModule
  ],
  providers: [
    PortalFactsService
  ]
})
export class PortalFactsModule { }

```

For the service we will take the assumption that portalFacts are sent as post parameters and injected in the index.html data-post property.
A runtime example could be :

```html

<body data-post='{"portalFacts":[{"key":"portalFactName1","value":"portalFactValue2"}]}'>
    ...

</body>
```

We will just use the RequestParametersService to get this value and create the map from it.
The service will look like :

```typescript
import {Injectable} from '@angular/core';
import {FactsService, PortalFacts, RulesEngineRunnerService, FactSet} from '@o3r/rules-engine';
import {RequestParametersService} from '@o3r/dynamic-content';
import {of} from 'rxjs';

@Injectable()
export class PortalFactsService extends FactsService<PortalFacts> {

  public facts: FactSet<PortalFacts>;

  constructor(rulesEngine: RulesEngineRunnerService, requestParametersService: RequestParametersService) {
    super(rulesEngine);
    // Ex index.html with data  <body data-post='{"portalFacts":[{"key":"portalFactName1","value":"portalFactValue2"}]}'> </body>
    const portalFacts = this.handleRawPortalFacts(requestParametersService.getPostParameter('portalFacts'));
    this.facts = {portalFacts: of(portalFacts)};
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

And finally you need to add the module in your app module and inject the service in your app component to register portalFacts :

```typescript
...
constructor(...,private portalFactsService: PortalFactsService)
...
this.portalFactsService.register();
...

```

And... that's it ! portalFacts is now part of the registered facts and will contain the values sent by the portal.

**IMPORTANT:** Since the portal facts are handled differently from the other facts on the CMS side they are not part of metadata
that means that the naming is a contract with the application and needs to be exactly "portalFacts".

## How to use in your rules

You can reference portalFacts as you would reference any other facts: you just need to apply a json path to specify which fact you want to access.
A simple example of a condition would be :

```json
  "condition": {
    "lhs": {
      "type": "FACT",
      "value": "portalFacts",
      "path" : "$.portalFactName1"
    },
    "operator": "equals",
    "rhs": {
      "type": "LITERAL",
      "value": "portalFactValue1"
    }
  }
```
