import { Configuration, otterComponentInfoPropertyName } from '@o3r/core';
import { ConfigurationObserver } from './configuration.observer';
import type { ConfigurationSignal } from './configuration.signal';

const decorator = (target: any, key: string) => {
  const privateField = `_${key}`;

  if (delete target[key]) {
    Object.defineProperty(target, key, {
      get: function (this: any) {
        return this[privateField];
      },
      set: function (this: any, value: ConfigurationObserver<Configuration> | ConfigurationSignal<Configuration>) {
        this[privateField] = value;
        if (this[otterComponentInfoPropertyName]) {
          this[otterComponentInfoPropertyName].configId = this[privateField].configId;
        }
      },
      enumerable: true,
      configurable: true
    });
  }
};

/**
 * Decorator to identify the configuration observer
 * @deprecated please use O3rConfig, will be removed in v12
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ConfigObserver() {
  return decorator;
}

/**
 * Decorator to identify the component's configuration
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function O3rConfig() {
  return decorator;
}
