import {
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import {
  StoreModule,
} from '@ngrx/store';
import {
  LoggerModule,
} from '@o3r/logger';
import type {
  StorageSyncOptions,
} from '@o3r/store-sync';
import {
  CapacitorRehydrater,
  STORAGE_SYNC_OPTIONS,
} from './rehydrater';

@NgModule({
  imports: [
    StoreModule,
    LoggerModule
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
        { provide: STORAGE_SYNC_OPTIONS, useValue: options }
      ]
    };
  }
}
