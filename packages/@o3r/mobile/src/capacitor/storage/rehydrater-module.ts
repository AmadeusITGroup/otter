import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  provideLogger,
} from '@o3r/logger';
import type {
  StorageSyncOptions,
} from '@o3r/store-sync';
import {
  CapacitorRehydrater,
  STORAGE_SYNC_OPTIONS,
} from './rehydrater';

/**
 * @deprecated Will be removed in v16. Use {@link provideCapacitorRehydrater} instead.
 */
@NgModule({
  imports: [
    StoreModule
  ],
  providers: [
    CapacitorRehydrater
  ]
})
export class CapacitorRehydraterModule {
  public static forRoot(options: StorageSyncOptions): ModuleWithProviders<CapacitorRehydraterModule> {
    return {
      ngModule: CapacitorRehydraterModule,
      providers: [
        provideLogger(),
        { provide: STORAGE_SYNC_OPTIONS, useValue: options }
      ]
    };
  }
}

/**
 * Provide capacitor rehydrater.
 * @param options Storage sync options
 */
export function provideCapacitorRehydrater(options: StorageSyncOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideLogger(),
    { provide: STORAGE_SYNC_OPTIONS, useValue: options },
    CapacitorRehydrater
  ]);
}
