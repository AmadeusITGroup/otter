import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  Action,
  ActionReducer,
  provideState,
  StoreModule,
} from '@ngrx/store';
import {
  assetPathOverrideReducer,
} from './asset-path-override.reducer';
import {
  ASSET_PATH_OVERRIDE_STORE_NAME,
  AssetPathOverrideState,
} from './asset-path-override.state';

/** Token of the AssetPathOverride reducer */
export const ASSET_PATH_OVERRIDE_REDUCER_TOKEN = new InjectionToken<ActionReducer<AssetPathOverrideState, Action>>('Feature AssetPathOverride Reducer');

/** Provide default reducer for AssetPathOverride store */
export function getDefaultAssetPathOverrideReducer() {
  return assetPathOverrideReducer;
}

/** @deprecated Will be removed in v16. Use {@link provideAssetPathOverrideStore} instead. */
@NgModule({
  imports: [
    StoreModule.forFeature(ASSET_PATH_OVERRIDE_STORE_NAME, ASSET_PATH_OVERRIDE_REDUCER_TOKEN)
  ],
  providers: [
    { provide: ASSET_PATH_OVERRIDE_REDUCER_TOKEN, useFactory: getDefaultAssetPathOverrideReducer }
  ]
})
export class AssetPathOverrideStoreModule {
  public static forRoot<T extends AssetPathOverrideState>(reducerFactory: () => ActionReducer<T, Action>): ModuleWithProviders<AssetPathOverrideStoreModule> {
    return {
      ngModule: AssetPathOverrideStoreModule,
      providers: [
        { provide: ASSET_PATH_OVERRIDE_REDUCER_TOKEN, useFactory: reducerFactory }
      ]
    };
  }
}

/**
 * Provide the AssetPathOverride store for the application.
 * @param reducerFactory Optional custom reducer factory. Falls back to the default reducer.
 */
export function provideAssetPathOverrideStore(reducerFactory?: () => ActionReducer<AssetPathOverrideState, Action>): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(ASSET_PATH_OVERRIDE_STORE_NAME, reducerFactory ? reducerFactory() : assetPathOverrideReducer),
    { provide: ASSET_PATH_OVERRIDE_REDUCER_TOKEN, useFactory: reducerFactory || (() => assetPathOverrideReducer) }
  ]);
}
