import {
  computeItemIdentifier,
  deepFill
} from '@o3r/core';
import {
  Observable
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay
} from 'rxjs/operators';

/**
 * Interface to define the error messages into component configuration
 */
export interface ErrorMessages {
  /**
   * Error message map
   */
  errorMessages: { [key: string]: string };
}

/**
 * Interface to specify that the component has an ID
 */
export interface Identifiable {
  /**
   * Identifier
   */
  id: string;
}

/**
 * Get the configuration name
 * @deprecated use {@link computeItemIdentifier} from @o3r/core. Will be removed in v12
 * @param componentName Name of the component to get the configuration
 * @param libraryName Name of the library the component is coming from
 */
export function computeConfigurationName(componentName: string, libraryName?: string) {
  return computeItemIdentifier(componentName, libraryName);
}

/**
 * Get the component and library's names based on the configuration name
 * @param configurationName Name of the component as found in the store
 * @returns Object containing library and component name.
 */
export function parseConfigurationName(configurationName: string): { library?: string; libraryName?: string; componentName: string } | undefined {
  const parsedConfigurationName = configurationName.match(/^([^#]*)#(.*)$/i);
  if (parsedConfigurationName) {
    return {
      library: parsedConfigurationName.length > 2 ? parsedConfigurationName[1] : undefined,
      componentName: parsedConfigurationName.length > 2 ? parsedConfigurationName[2] : parsedConfigurationName[0]
    };
  }
}

/**
 * Operator to get the configuration from store for a given component and merge it with the global config
 * @param defaultValue Default value of the configuration
 */
export function getConfiguration<T extends Record<string, unknown>>(defaultValue: T) {
  return <C extends Partial<T>>(source: Observable<C | undefined >): Observable<T> =>
    source.pipe(
      map((configOverride) => {
        return deepFill(defaultValue, configOverride);
      }),
      distinctUntilChanged((prev, current) => JSON.stringify(prev) === JSON.stringify(current)),
      shareReplay(1)
    );
}
