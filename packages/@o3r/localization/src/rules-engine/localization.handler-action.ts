import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { RulesEngineActionHandler } from '@o3r/core';
import { LocalizationOverrideStore, setLocalizationOverride } from '@o3r/localization';
import { ActionUpdateLocalisationBlock, RULES_ENGINE_LOCALISATION_UPDATE_ACTION_TYPE } from './localization.interfaces';

/**
 * Service to handle async Localization actions
 */
@Injectable()
export class LocalizationRulesEngineActionHandler implements RulesEngineActionHandler<ActionUpdateLocalisationBlock> {

  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_LOCALISATION_UPDATE_ACTION_TYPE] as const;

  constructor(private store: Store<LocalizationOverrideStore>) {
  }

  /** @inheritdoc */
  public executeActions(actions: ActionUpdateLocalisationBlock[]): void | Promise<void> {
    const localizationOverrides = actions.reduce<Record<string, string>>((acc, {key, value}) => {
      acc[key] = value;
      return acc;
    }, {});

    this.store.dispatch(setLocalizationOverride({ state: { localizationOverrides } }));
  }
}
