import {
  NgModule,
} from '@angular/core';
import {
  AssetRulesEngineActionHandler,
} from './asset.handler-action';
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
