import {
  Injectable,
} from '@angular/core';
import {
  Store,
} from '@ngrx/store';
import type {
  RulesEngineActionHandler,
} from '@o3r/core';
import {
  AssetPathOverrideStore,
  setAssetPathOverride,
} from '../stores/index';
import {
  ActionUpdateAssetBlock,
  RULES_ENGINE_ASSET_UPDATE_ACTION_TYPE,
} from './asset.interfaces';

/**
 * Service to handle async Asset actions
 */
@Injectable()
export class AssetRulesEngineActionHandler implements RulesEngineActionHandler<ActionUpdateAssetBlock> {
  /** @inheritdoc */
  public readonly supportingActions = [RULES_ENGINE_ASSET_UPDATE_ACTION_TYPE] as const;

  constructor(private readonly store: Store<AssetPathOverrideStore>) {}

  /** @inheritdoc */
  public executeActions(actions: ActionUpdateAssetBlock[]): void | Promise<void> {
    const assetPathOverrides = actions.reduce<Record<string, string>>((acc, { asset, value }) => {
      acc[asset] = value;
      return acc;
    }, {});

    this.store.dispatch(setAssetPathOverride({ state: { assetPathOverrides } }));
  }
}
