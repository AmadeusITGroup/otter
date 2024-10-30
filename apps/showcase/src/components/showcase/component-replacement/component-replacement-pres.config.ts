import type {
  Configuration
} from '@o3r/core';
import {
  computeItemIdentifier
} from '@o3r/core';

/**
 * Configuration of component replacement base component
 */
export interface ComponentReplacementPresConfig extends Configuration {
  /** Key to identify the right presentation component to use for the datepicker */
  datePickerCustomKey: string;
}

/** Default config of component replacement base component */
export const COMPONENT_REPLACEMENT_PRES_DEFAULT_CONFIG: ComponentReplacementPresConfig = {
  datePickerCustomKey: ''
};

/** Identifier for component replacement base component, used in the configuration store */
export const COMPONENT_REPLACEMENT_PRES_CONFIG_ID = computeItemIdentifier('ComponentReplacementPresConfig', 'showcase');
