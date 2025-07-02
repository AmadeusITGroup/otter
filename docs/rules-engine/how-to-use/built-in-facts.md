# Rules engine - Built-in facts

In some cases, the Otter [operators](../README.md#operator) may refer to an implicit fact. This is the case for
the `dateInNextMinutes` and `dateNotInNextMinutes` operators.

The definition of these two operators implies the notion of a current date, hence, the framework needs to expose an 
internal, built-in fact that will always be used by them: the `o3rCurrentTime`. The operators will not take it as input, 
making it an implicit fact of these operators. This also means that, while all the other operators are pure functions,
this is not the case for `dateInNextMinutes` nor `dateNotInNextMinutes`.

While this fact is provided in the rules engine module, you should be able to override its implementation to fit your needs.

This section explains how to use operators with an implicit fact and how to override the fact implementation.

## Usage
The operators using a built-in implicit fact are used in the same way as any other operator, the implicit fact will just
not be referred to in the Ruleset object:
```json5
{
  "id": "5467e501-b9ff-414f-8026-56885d0d7a4c",
  "name": "The otter is late",
  "disabled": false,
  "outputRuntimeFacts": [],
  "inputRuntimeFacts": [],
  "rootElement": {
    "elementType": "RULE_BLOCK",
    "blockType": "IF_ELSE",
    "condition": {
      "all": [
        {
          "lhs": {
            "type": "FACT",
            "value": "outboundDate"
          },
          "rhs": {
              "type": "LITERAL",
              "value": "2880"
          },
          "operator": "dateInNextMinutes"
        }
      ]
    },
    "successElements": [
      {
        "elementType": "ACTION",
        "actionType": "UPDATE_ASSET",
        "asset": "otter.svg",
        "value": "otter-late.svg"
      }
    ],
    "failureElements": []
  }
}
```

This does not mean that the fact itself should not be registered.
If you fail to register the fact the same way as the non-built-in facts, the whole ruleset will fail.

```typescript
import {Component, OnInit} from '@angular/core';
import {CurrentTimeFactsService} from '@o3r/rules-engine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private currentTimeFactsService: CurrentTimeFactsService) {}

  ngOnInit() {
    this.currentTimeFactsService.register();
  }
}
```

To avoid performance issue and to allow you to use the best logic for your needs, the ``CurrentTimeFactsService`` is
based on a simple implementation of a refresh mechanism without a default refresh timer.

Instead, it is up to the application to choose when to refresh the fact via its ``tick`` method (on page navigation, at a
given time interval, etc. ).

> [!INFO]
> The reason why the fact is not registered automatically, even though it is provided by the module, is to allow the 
> override of the fact.

## Override the default built-in fact

If you do not want to rely on the provided service and its refresh mechanism, you can create your own custom fact
service.
If you want to override the `o3rCurrentTime` logic, you just need to make sure that you expose a fact with the same name
that will be used for the `dateInNextMinutes` and`dateNotInNextMinutes` operators.

```typescript
import { Injectable } from '@angular/core';
import { CurrentTimeFacts, FactsService, RulesEngineService } from '@o3r/rules-engine';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomCurrentTimeFactsService extends FactsService<CurrentTimeFacts> {

  private currentTimeSubject$ = new BehaviorSubject();
  /** @inheritDoc */
  public facts = {
    // Emits every 10 minute
    o3rCurrentTime: interval(600000).pipe(map(() => (new Date()).getTime()))
  };

  constructor(rulesEngine: RulesEngineService) {
    super(rulesEngine);
  }
}
```

Then, just register your service in your application following the [custom fact documentation](./custom-fact.md).
