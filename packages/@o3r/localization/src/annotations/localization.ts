import { deepFill, immutablePrimitive, otterComponentInfoPropertyName } from '@o3r/core';

/**
 * Decorator to pass localization url
 * @param _url
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Localization(_url: string) {
  return (target: any, key: string) => {
    const privateField = _url || `_${key}`;
    const privateValue = target[key];

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: function (this: any) {
          return this[privateField];
        },
        set: function (this: any, value: Record<string, unknown>) {
          const currentField = this[privateField] || privateValue;
          this[privateField] = typeof currentField === 'undefined' ? immutablePrimitive(value) : deepFill(currentField, value);
          if (this[otterComponentInfoPropertyName]) {
            this[otterComponentInfoPropertyName].translations = this[privateField];
          }
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
