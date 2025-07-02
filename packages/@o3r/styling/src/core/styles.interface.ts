import type {
  ItemIdentifier,
} from '@o3r/core';

export type CssVariableType = 'string' | 'color';

/** Metadata for a CSS Variable */
export interface CssVariable {
  /** Name of the variable */
  name: string;
  /** Default value of the variable */
  defaultValue: string;
  /** References of the variable */
  references?: CssVariable[];
  /** Tags of the variable */
  tags?: string[];
  /** Description of the variable */
  description?: string;
  /** Description of the variable */
  label?: string;
  /** Type of the variable */
  type?: CssVariableType;
  /** Name of a group of variables */
  category?: string;
  /** component reference if the variable is linked to one */
  component?: ItemIdentifier;
}

/** Style Metadata map */
export interface CssMetadata {
  /** Variables' dictionary */
  variables: {
    [name: string]: CssVariable;
  };
}
