/**
 * Unique identifier of an item in the extracted metadata
 * Note: This the duplication of {@link import('@o3r/core').ItemIdentifier} as its import is not supported as Node16+ module
 * TODO: Remove this interface when #2885 is fixed
 */
export interface ItemIdentifier {
  /**
   * Name of the library where the item is originally from
   */
  library: string;
  /**
   * Name of the metadata item
   */
  name: string;
}

/** Metadata information added in the design token extension for Metadata extraction */
export interface DesignTokenMetadata {
  /** List of tags */
  tags?: string[];
  /** Description of the variable */
  label?: string;
  /** Name of a group of variables */
  category?: string;
  /** Component reference if the variable is linked to one */
  component?: ItemIdentifier;
}

/** CSS Variable possible types */
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
