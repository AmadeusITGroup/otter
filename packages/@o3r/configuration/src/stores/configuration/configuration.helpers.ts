import type {
  Configuration,
  CustomConfig,
} from '@o3r/core';
import {
  computeItemIdentifier,
} from '@o3r/core';
import {
  SetConfigurationEntitiesPayload,
} from './configuration.actions';

/**
 * compute the configuration into SetEntitiesPayload
 * @param customConfigObject array of configurations
 */
export function computeConfiguration<T extends Configuration>(customConfigObject: CustomConfig<T>[]): SetConfigurationEntitiesPayload {
  const entities = customConfigObject.reduce<{ [k: string]: Partial<T> & { id: string } }>((acc, conf) => {
    const id = computeItemIdentifier(conf.name, conf.library);
    acc[id] = { ...conf.config, id };
    return acc;
  }, {});
  return { entities };
}
