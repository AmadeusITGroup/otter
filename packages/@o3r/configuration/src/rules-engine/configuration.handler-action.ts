import {
  Injectable,
} from '@angular/core';
import {
  Store,
} from '@ngrx/store';
import {
  ConfigurationStore,
  PropertyOverride,
  setConfigOverride,
} from '@o3r/configuration';
import type {
  RulesEngineActionHandler,
} from '@o3r/core';
import {
  computeItemIdentifier,
} from '@o3r/core';
import {
  ActionUpdateConfigBlock,
  RULES_ENGINE_CONFIGURATION_UPDATE_ACTION_TYPE,
} from './configuration.interfaces';

/**
 * Service to handle async Configuration actions
 */
@Injectable()
export class ConfigurationRulesEngineActionHandler implements RulesEngineActionHandler<ActionUpdateConfigBlock> {
  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_CONFIGURATION_UPDATE_ACTION_TYPE] as const;

  constructor(private readonly store: Store<ConfigurationStore>) {}

  /** @inheritdoc */
  public executeActions(actions: ActionUpdateConfigBlock[]): void | Promise<void> {
    const configOverrideMap = actions
      .filter((action) => action.library && action.component && action.property && typeof action.value !== 'undefined')
      .reduce<Record<string, PropertyOverride>>((acc, ov) => {
        const configName = computeItemIdentifier(ov.component, ov.library);
        acc[configName] ||= { overrides: {} };
        acc[configName].overrides[ov.property] = ov.value;
        return acc;
      }, {});

    const configOverrides = Object.entries(configOverrideMap)
      .reduce<Record<string, PropertyOverride>>((acc, [key, value]) => {
        acc[key] = value.overrides;
        return acc;
      }, {});

    this.store.dispatch(setConfigOverride({ state: { configOverrides } }));
  }
}
