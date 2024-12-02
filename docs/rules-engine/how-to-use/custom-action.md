# Rules engine - Custom Actions

The Otter framework offers a set of ready-to-use [actions](../README.md#action).
If your application has requirements that are not covered by them, you can enhance the `RulesEngineRunnerService` and
register your own custom actions. Let's see how to do it.

> [!WARNING]
> If you administrate your Rulesets with a UI (for example a CMS), don't forget to make sure it will support these new actions.
> Otter is a frontend framework and can only provide metadata and features on your web application, you are responsible
> for ensuring the compatibility of the metadata of your project with your solutions.

> [!WARNING]
> The Otter schema for rulesets is quite strict and will not allow for actions that are not supported by the framework.
> You will not be able to validate your schema with the Otter one if you plan to use your own actions and will need to
> define your own schema.

## Implement your own action

An action is a service that extends the `RulesEngineActionHandler` and that handles `RulesEngineActions`.
It exposes a list of supported action IDs thanks to its `supportingActions` property and will run them in the
`executeActions` method.

Let's imagine an action that will display popups in your application.

You first need to define an id for this action. This id will be the link between your static rules and the engine.

Let's call it `DISPLAY_POPUP` and set it in the list of `supportingActions` of our own `PopupActionHandler`.

```typescript
import {Injectable} from '@angular/core';
import type {RulesEngineActionHandler, RulesEngineAction} from '@o3r/core';

export const RULES_ENGINE_POPUP_ACTION_TYPE = 'DISPLAY_POPUP';

/**
 * Service to handle async Asset actions
 */
@Injectable()
export class PopupActionHandler implements RulesEngineActionHandler<RulesEngineAction> {

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_POPUP_ACTION_TYPE] as const;

  /** @inheritdoc */
  public executeActions(actions: RulesEngineAction[]): void | Promise<void> {
  }
}
```

Now you might need to add a payload to your action, so that you can identify the popup to display.
This payload will then be directly set in your rule actions:

```json5
{
  "actionType": "DISPLAY_POPUP",
  "popupId": "popup-identifier"
}
```

To support a payload, just create your own interface that will extend `RulesEngineAction` and will define the contract
between your JSON and your application. For this use case, let's call it `ActionDisplayPopup`.

```typescript
import {Injectable} from '@angular/core';
import type {RulesEngineActionHandler, RulesEngineAction} from '@o3r/core';

export const RULES_ENGINE_POPUP_ACTION_TYPE = 'DISPLAY_POPUP';

export interface ActionDisplayPopup extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_POPUP_ACTION_TYPE;
  popupId: string;
}

/**
 * Service to handle async Asset actions
 */
@Injectable()
export class PopupActionHandler implements RulesEngineActionHandler<ActionDisplayPopup> {

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_POPUP_ACTION_TYPE] as const;

  /** @inheritdoc */
  public executeActions(actions: ActionDisplayPopup[]): void | Promise<void> {
  }
}
```

Simply implement your action logic in `executeActions` and your action will be ready to be registered.

```typescript
import {inject, Injectable} from '@angular/core';
import type {RulesEngineActionHandler, RulesEngineAction} from '@o3r/core';
import {PopupManagerService} from '../services/popupManager';

export const RULES_ENGINE_POPUP_ACTION_TYPE = 'DISPLAY_POPUP';

export interface ActionDisplayPopup extends RulesEngineAction {
  actionType: typeof RULES_ENGINE_POPUP_ACTION_TYPE;
  popupId: string;
}

/**
 * Service to handle async Asset actions
 */
@Injectable()
export class PopupActionHandler implements RulesEngineActionHandler<ActionDisplayPopup> {

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_POPUP_ACTION_TYPE] as const;

  private readonly popupManagerService = inject(PopupManagerService);

  /** @inheritdoc */
  public executeActions(actions: ActionDisplayPopup[]): void {
    if (actions.length === 0) {
      this.popupManagerService.hidePopup();
    } else if (actions.length > 1) {
      this.popupManagerService.raiseWarning('More than one popup requested, only first one will be considered');
    }
    this.popupManagerService.displayPopup(actions[0].popupId);
  }
}
```

Don't forget to provide your service for your application to register it in your `AppComponent`.

## Register your action

To make the action available for the rulesets, you need to register it in the `RulesEngineRunnerService`.
You can do it in your `main.ts`.

```typescript
import {inject, runInInjectionContext} from '@angular/core';
import {RulesEngineRunnerService} from '@o3r/rules-engine';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {PopupActionHandler} from './services/popup-action-handler';

bootstrapApplication(AppComponent, appConfig)
  .then((m) => {
    runInInjectionContext(m.injector, () => {
      inject(RulesEngineRunnerService);
      ruleEngine.registerActionHandlers(inject(PopupActionHandler));
    });
  })
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
```
