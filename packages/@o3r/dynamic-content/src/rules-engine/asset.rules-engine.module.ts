import { NgModule } from '@angular/core';
import { AssetPathOverrideStoreModule } from '@o3r/dynamic-content';
import { AssetRulesEngineActionHandler } from './asset.handler-action';

@NgModule({
  imports: [
    AssetPathOverrideStoreModule
  ],
  providers: [
    AssetRulesEngineActionHandler
  ]
})
export class AssetRulesEngineActionModule {}
