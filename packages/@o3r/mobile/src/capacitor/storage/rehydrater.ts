import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Store } from '@ngrx/store';
import { dateReviver, isLocalStorageConfig, isSerializer, rehydrateAction, StorageSyncOptions } from '@o3r/store-sync';
import { LoggerService } from '@o3r/logger';

/**
 * Injection token for the storage sync options
 */
export const STORAGE_SYNC_OPTIONS = new InjectionToken<Partial<StorageSyncOptions>>('STORAGE_SYNC_OPTIONS');

@Injectable()
export class CapacitorRehydrater {
  private options: StorageSyncOptions;
  constructor(
      private store: Store<any>,
      @Inject(STORAGE_SYNC_OPTIONS) options: Partial<StorageSyncOptions>,
      private logger: LoggerService
  ) {
    this.options = { keys: [], ...options };
  }

  /**
   * Dispatch an action to rehydrate the store with the data from the storage
   */
  public async rehydrate() {
    if (isLocalStorageConfig(this.options)) {
      this.logger.warn('A non-async storage is used, rehydration is not supported');
      return;
    }
    const storageCalls: Promise<Record<string, any> | undefined>[] = this.options.keys
      .map(async (key) => {
        const storeName = Object.keys(key)[0];
        const storeSynchronizer = key[storeName];
        let reviver = this.options.restoreDates ? dateReviver : undefined;
        let deserialize: (raw: string) => any = (raw: string) => raw;

        if (isSerializer(storeSynchronizer)) {
          if (storeSynchronizer.reviver) {
            reviver = storeSynchronizer.reviver;
          }
          if (storeSynchronizer.deserialize) {
            deserialize = storeSynchronizer.deserialize;
          }
        }

        const stateSlice = await this.options.storage!.getItem(
          this.options.storageKeySerializer
            ? this.options.storageKeySerializer(storeName)
            : storeName
        );
        if (stateSlice) {

          const isObjectRegex = /{|\[/;
          let raw = stateSlice;

          if (stateSlice === 'null' || stateSlice === 'true' || stateSlice === 'false' || isObjectRegex.test(stateSlice.charAt(0))) {
            raw = JSON.parse(stateSlice, reviver);
          }

          return {
            [storeName]: deserialize(raw)
          };
        }
      });

    const result = await Promise.all(storageCalls);

    this.store.dispatch(
      rehydrateAction({
        payload: result.reduce(
          (acc: Record<string, any>, store) => ({...acc, ...store}),
          {}
        )
      })
    );
  }
}
