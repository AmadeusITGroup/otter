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
} from '@o3r/dynamic-content';

/** @deprecated Will be removed in v16. Use {@link provideAssetRulesEngineAction} instead. */
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
 * Provide asset rules engine action handler for the application.
 */
export function provideAssetRulesEngineAction(): EnvironmentProviders {
  return makeEnvironmentProviders([
    AssetRulesEngineActionHandler
  ]);
}
