import type { CategoryDescription, ConfigPropertyWidget, Output } from '@o3r/core';

/** Types of components config */
export type ConfigType = 'Block' | 'Page' | 'AppRuntimeConfiguration' | 'AppBuildConfiguration' | 'ExposedComponent';

/** Type of components we can have in an application */
export type ComponentStructure = 'PAGE' | 'BLOCK' | 'COMPONENT' | 'APPLICATION' | 'NESTED_ELEMENT' | 'EXPOSED_COMPONENT';

/** Component context information */
export interface ComponentContext {
  /** Context library */
  library: string;
  /** Context class name */
  name: string;
}

/** Component config information */
export interface ComponentConfig {
  /** Config library */
  library: string;
  /** Config class name */
  name: string;
}

/** Placeholder data identifier */
export interface PlaceholderData {
  /** Id of the placeholder */
  id: string;
  /** Description of the placeholder */
  description: string;
}

/** Placeholder metadata */
export interface PlaceholdersMetadata {
  /** Component library */
  library: string;
  /** Component name */
  name: string;
  /** Placeholders available for the component */
  placeholders: PlaceholderData[];
}

/**
 * Output generated for component class metadata
 */
export interface ComponentClassOutput extends Output {
  /** Component library */
  library: string;
  /** Component name */
  name: string;
  /** Component path */
  path: string;
  /** Component selector */
  selector: string;
  /** Component type */
  type: ComponentStructure;
  /** Component context */
  context?: ComponentContext;
  /** Component config */
  config?: ComponentConfig;
  /** Placeholders available for the component */
  placeholders?: PlaceholderData[];
  /** Determine if the component is activating a ruleset */
  linkableToRuleset: boolean;
  /** List of localization keys used in the component */
  localizationKeys?: string[];
}

/** Property types */
export type ConfigPropertyTypes = 'boolean' | 'number' | 'string' | 'string[]' | 'element[]' | 'enum' | 'enum[]' | 'unknown' | 'unknown[]';

/**
 * Interface that check if the Nested configuration defined match the cms requirements
 * It only supports a 1 level depth object, containing primitive types (string | number | boolean)
 */
export interface NestedConfiguration {
  [key: string]: string | boolean | number;
}

/** Representation of a config field */
export interface ConfigProperty {
  /** Name of the configuration property */
  name: string;
  /** Description associated to the configuration property */
  description: string;
  /** Configuration type: string, number, boolean ... */
  type: ConfigPropertyTypes;
  /** Config property default value if primitive */
  value?: string;
  /** Config property default values if array of primitive */
  values?: (string | NestedConfiguration)[];
  /** Label to be used in the CMS for this config */
  label: string;
  /** Reference to the nested configuration if applicable */
  reference?: { library: string; name: string };
  /** List of possible value options */
  choices?: string[];
  /** The category of the config property */
  category?: string;
  /** The CMS widget information */
  widget?: ConfigPropertyWidget;
  /** If true, the CMS user must specify a value for the property */
  required?: boolean;
}

/**
 * Output generated for component config metadata
 */
export interface ComponentConfigOutput extends Output {
  /** Component's library */
  library: string;
  /** Component type */
  type: ComponentStructure;
  /** Flag for application config to identify it as a runtime config */
  runtime?: boolean;
  /** Title of the configuration property */
  title?: string;
  /** Description associated to the configuration property */
  description?: string;
  /** Configuration tags */
  tags?: string[];
  /** Configuration fields */
  properties: ConfigProperty[];
  /** Category (taken from <o3rCategories> tag) */
  categories?: CategoryDescription[];
}

/**
 * Output generated for component config metadata
 */
export interface ComponentConfigOutputs {
  /**
   * List of configuration output for a component
   */
  componentConfigOutput: ComponentConfigOutput[];
}

/**
 * Output generated for component metadata
 */
export interface ComponentOutput {
  components: ComponentClassOutput[];
  configurations: ComponentConfigOutput[];
}
