import {
  NgModule,
} from '@angular/core';
import {
  AssetRulesEngineActionHandler,
} from './asset-rules-engine-action-handler';
import {
  AssetPathOverrideStoreModule,
} from '@o3r/dynamic-content';

@NgModule({
  imports: [
    AssetPathOverrideStoreModule
  ],
  providers: [
    AssetRulesEngineActionHandler
  ]
})
export class AssetRulesEngineActionModule {}
