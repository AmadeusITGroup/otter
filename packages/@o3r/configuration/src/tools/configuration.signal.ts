import type { InputSignal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import type { Configuration } from '@o3r/core';
import { shareReplay } from 'rxjs';
import { getConfiguration } from '../core';
import type { ConfigurationBaseService } from '../services';

/** Configuration signal */
export type ConfigurationSignal<T> = Signal<T> & { configId: string };

/**
 * Get a configuration signal
 * @param configInput
 * @param configId
 * @param defaultConfig
 * @param configurationService
 */
export const configSignal = <T extends Configuration>(
  configInput: InputSignal<Partial<T> | undefined>,
  configId: string,
  defaultConfig: T,
  configurationService?: ConfigurationBaseService | null
): ConfigurationSignal<T> => {
  if (configurationService) {
    configurationService.extendConfiguration(defaultConfig, configId);
  }

  const signal: ConfigurationSignal<T> = toSignal(
    toObservable(configInput).pipe(
      configurationService ? configurationService.getComponentConfig(configId, defaultConfig) : getConfiguration(defaultConfig),
      shareReplay({ bufferSize: 1, refCount: true })
    ),
    { initialValue: defaultConfig }
  ) as ConfigurationSignal<T>;
  signal.configId = configId;
  return signal;
};
