import { Configuration, otterComponentInfoPropertyName } from '@o3r/core';
import { ConfigurationObserver } from './configuration.observer';

/**
 * Decorator to identify the configuration observer
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ConfigObserver() {
  return (target: any, key: string) => {
    const privateField = `_${key}`;

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: function (this: any) {
          return this[privateField];
        },
        set: function (this: any, value: Record<string, unknown>) {
          this[privateField] = value;
          if (this[otterComponentInfoPropertyName]) {
            this[otterComponentInfoPropertyName].configId = (this[privateField] as ConfigurationObserver<Configuration>).configId;
          }
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
