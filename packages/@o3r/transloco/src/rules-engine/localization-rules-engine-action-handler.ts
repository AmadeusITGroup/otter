import {
  inject,
  Injectable,
} from '@angular/core';
import {
  Store,
} from '@ngrx/store';
import type {
  RulesEngineActionHandler,
} from '@o3r/core';
import {
  ActionUpdateLocalizationBlock,
  RULES_ENGINE_LOCALIZATION_UPDATE_ACTION_TYPE,
} from './localization-interfaces';
import {
  LocalizationOverrideStore,
  setLocalizationOverride,
} from '@o3r/transloco';

/**
 * Service to handle async Localization actions
 */
@Injectable()
export class LocalizationRulesEngineActionHandler implements RulesEngineActionHandler<ActionUpdateLocalizationBlock> {
  private readonly store = inject<Store<LocalizationOverrideStore>>(Store);

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_LOCALIZATION_UPDATE_ACTION_TYPE] as const;

  /** @inheritdoc */
  public executeActions(actions: ActionUpdateLocalizationBlock[]): void | Promise<void> {
    const localizationOverrides = actions.reduce<Record<string, string>>((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    this.store.dispatch(setLocalizationOverride({ state: { localizationOverrides } }));
  }
}
