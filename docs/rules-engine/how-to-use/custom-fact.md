# Rules engine - Create custom fact in your application

The rules applied on your application can rely on facts and literal inputs (static values). The facts generally represent
data specific to your application and your business. 
For this reason, the Otter framework does not provide any facts but the [implicit built-in facts](./built-in-facts.md).

Let's see how to create a custom fact.

## Implementation

Facts are managed in services that extend the `FactsService` provided by `@o3r/rules-engine`. The service
exposes a `fact` map linking the key of each fact exposed in the service to their respective value, which can either
be an instance, a `Promise` or an `Observable` of the fact.

The facts exposed by the service are defined in a dedicated interface that extends `FactDefinitions`. 

You can generate the fact structure thanks to the `ng g facts-service [name] -- --path=[path-to-my-fact-folder] ` command.

This will result in two files:
* The fact definition
```typescript
import type { FactDefinitions } from '@o3r/rules-engine';

export interface CustomFacts extends FactDefinitions {
  fact1: boolean;
  fact2: string;
}

```
* The service fact
```typescript
import {FactsService} from '@o3r/rules-engine';
import type {CustomFacts} from './custom.facts.ts';

@Injectable()
export class CustomFactsService extends FactsService<CustomFacts> {

  public facts = {};

}
```

In order to use the fact, you need to define its logic. It can be based on manual update, on the selection of a subset
of state, on services etc.

For this example, the `fact1` will be based on a store and the `fact2` will be set once and will reflect the user's browser 
agent.

```typescript
import {FactsService} from '@o3r/rules-engine';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, map, select} from 'rxjs/operators';
import {selectUserSelection} from '../store/user-selection';
import type {SelectionState} from '../store/user-selection';
import type {CustomFacts} from './custom.facts.ts';

@Injectable()
export class CustomFactsService extends FactsService<CustomFacts> {

  constructor(store: Store<SelectionState>) {
    super();
    this.facts = {
      fact1: store.pipe(
        filter((store) => !!store.userSelection),
        select(selectUserSelection),
        map((userSelection) => !!userSelection),
        distinctUntilChanged()
      ),
      fact2: window.navigator.userAgent
    }
  }
}

```

> [!INFO]
> There are two interesting things to notice about `fact1`:
> * There is a pipe with a filter operator to ensure that the state is defined, before using it. This permits to register 
> the fact even if the store is lazy loaded later in the flow. This observable will not emit until the store is loaded, but
> rules engine will create the first emission (undefined) while waiting for the fact to emit its first value.
> * Facts based on observable should always contain a `distinctUntilChange()` to avoid the re-evaluation of all the rules
that depend on them.

Then, provide the service in a dedicated module. 

Note that you do not import your `UserSelectionStore` module here. This will allow the store to be lazy loaded when the 
application actually requires it.

```typescript
import {RulesEngineRunnerModule} from '@o3r/rules-engine';
import {CustomFactsService} from './custom-facts.service';

@NgModule({
  imports: [
    RulesEngineRunnerModule
  ],
  providers: [
    CustomFactsService
  ]
})
export class OrderFactsModule { }
```

You can now import your fact in your app module and register the facts:
```typescript
import {inject, runInInjectionContext} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {CustomFactsService} from './services/custom-fact.service';

bootstrapApplication(AppComponent, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      inject(CustomFactsService).register();
    });
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
```
The `FactService` extended by `CustomFactsService` will handle the registration on the `RulesEngineRunnerService`.

> [!IMPORTANT]
> If you administrate your rules in a dedicated UI, make sure to extract your facts with the rest of your metadata.
> Make sure to follow the [metadata documentation](./industrialize-ruleset-generation.md).
