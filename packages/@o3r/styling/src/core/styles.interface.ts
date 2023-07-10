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
}

/** Style Metadata map */
export interface CssMetadata {
  /** Variables' dictionary */
  variables: {
    [name: string]: CssVariable;
  };
}
