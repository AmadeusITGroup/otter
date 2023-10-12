import type { Type } from '@angular/core';
import type { Configuration, Context, DynamicConfigurable } from '@o3r/core';

/** Interface for grouping the arrays needed for custom component registration */
export interface EntryCustomComponents {

  /** Array of custom presenters */
  customComponents: Type<any>[];

  /** Array of custom presenter modules */
  customComponentsModules: Type<any>[];
}

/**
 *  Register a custom component
 * @param customComponentsMap an object containing the already registered custom component
 * @param customComponentKey
 * @param customComponent
 */
export function registerCustomComponent<T extends Context & DynamicConfigurable<Configuration>>(
    customComponentsMap: Map<string, Type<T>>, customComponentKey: string, customComponent: Type<T>) {
  customComponentsMap.set(customComponentKey, customComponent);
  return customComponentsMap;
}
