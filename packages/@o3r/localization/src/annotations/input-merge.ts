import { deepFill, immutablePrimitive } from '@o3r/core';

/**
 * Decorator for @Input property
 * It merges user input with default property value
 *
 * @param privateFieldName
 * @deprecated will be removed in v10
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function InputMerge(privateFieldName?: string) {
  return (target: any, key: string) => {
    const privateField = privateFieldName || `_${key}`;
    const privateValue = target[key];

    if (delete target[key]) {
      Object.defineProperty(target, key, {
        get: function (this: any) {
          return this[privateField];
        },
        set: function (this: any, value: Record<string, unknown>) {
          const currentField = this[privateField] || privateValue;
          this[privateField] = typeof currentField === 'undefined' ? immutablePrimitive(value) : deepFill(currentField, value);
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
