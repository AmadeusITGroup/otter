import type { InputSignal, Signal } from '@angular/core';
import type { Observable } from 'rxjs';

/**
 * Types available for configuration
 */
export type ConfigurationValueType = string | number | boolean;

/**
 * Nested configuration allowing one level only
 * Object should only contain primitive types
 */
export interface NestedConfiguration {
  [key: string]: ConfigurationValueType;
}

/**
 * Interface of configuration that is supported by the cms
 */
export interface Configuration {
  [key: string]: ConfigurationValueType | (string | NestedConfiguration)[];
}

/** Configuration model exported by the CMS */
export interface CustomConfig<T extends Partial<Configuration> = Partial<Configuration>> {

  /** Component name */
  name: string;

  /** Component's library name; No library name for global config */
  library?: string;

  /** Component configuration as key value pairs */
  config: T;
}

/**
 * Dynamically Configurable item
 */
export interface DynamicConfigurable<T extends Configuration> {
  /**
   * Configuration override
   */
  config: Partial<T> | undefined;

  /**
   * Configuration stream
   */
  config$: Observable<T>;
}

/**
 * Dynamically Configurable item working with signal
 */
export interface DynamicConfigurableWithSignal<T extends Configuration> {
  /**
   * Configuration override
   */
  config: InputSignal<Partial<T> | undefined>;

  /**
   * Configuration signal
   */
  configSignal: Signal<T>;
}

/**
 * Configurable item
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface Configurable<T extends {}> {
  /**
   * Configuration
   */
  config: T;
}


/**
 * Description of a configuration property extracted to the CMS
 */
export interface CategoryDescription {
  /** Category name */
  name: string;

  /** Category description */
  label: string;
}

/** Types of components config */
export type ConfigType = 'Block' | 'Page' | 'AppRuntimeConfiguration' | 'AppBuildConfiguration' | 'ExposedComponent';

/**
 * Interface to define widget parameter to be used on CMS side
 */
export interface ConfigPropertyWidgetParameters {
  [parameterName: string]: string | boolean | number | string[] | boolean[] | number[];
}

/**
 * Interface to define the widget to be used on CMS side
 */
export interface ConfigPropertyWidget {
  /** Type of the CMS widget */
  type: string;
  /** Parameters provided to the CMS widget */
  parameters?: ConfigPropertyWidgetParameters;
}
