import {
  NgModule,
} from '@angular/core';
import {
  AssetPathOverrideStoreModule,
} from '../stores/index';
import {
  AssetRulesEngineActionHandler,
} from './asset.handler-action';

@NgModule({
  imports: [
    AssetPathOverrideStoreModule
  ],
  providers: [
    AssetRulesEngineActionHandler
  ]
})
export class AssetRulesEngineActionModule {}
