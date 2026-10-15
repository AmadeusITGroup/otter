import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgModule,
} from '@angular/core';
import {
  AssetRulesEngineActionHandler,
} from './asset-rules-engine-action-handler';
import {
  AssetPathOverrideStoreModule,
  provideAssetPathOverrideStore,
} from '@o3r/dynamic-content';

/**
 * @deprecated Will be removed in v16. Use {@link provideAssetRulesEngineAction} instead.
 */
@NgModule({
  imports: [
    AssetPathOverrideStoreModule
  ],
  providers: [
    AssetRulesEngineActionHandler
  ]
})
export class AssetRulesEngineActionModule {}

/**
 * Provide asset rules engine action handler.
 */
export function provideAssetRulesEngineAction(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAssetPathOverrideStore(),
    AssetRulesEngineActionHandler
  ]);
}
