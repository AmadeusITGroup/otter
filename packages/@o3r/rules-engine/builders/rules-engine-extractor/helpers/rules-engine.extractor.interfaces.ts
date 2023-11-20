/** Supported types for a fact */
export type FactSupportedTypes = 'string' | 'number' | 'date' | 'object' | 'boolean';

/** Fact as description in the metadata file */
export interface MetadataFact {
  /** Name of the Fact */
  name: string;
  /** Fact description */
  description?: string;
  /** Type of the fact */
  type: FactSupportedTypes;
  /** Path to schema file describing the complex file */
  schemaFile?: string;
}

/** Supported types for a operand */
export type MetadataOperatorSupportedTypes = 'string' | 'number' | 'date' | 'object' | 'boolean';

/** All supported default type of an operator when not explicit by the operator (`unknown` as parameter)  */
export const allDefaultSupportedTypes: MetadataOperatorSupportedTypes[] = ['string', 'number', 'date', 'boolean'];

/** All supported types by the operator */
export const allSupportedTypes: MetadataOperatorSupportedTypes[] = ['string', 'number', 'date', 'boolean', 'object'];

/** Definition of an operand in the metadata */
export interface MetadataOperand {
  /** List of the support types for this operand */
  types: (MetadataOperatorSupportedTypes | 'unknown')[];
  /**
   * List of items supported by the operand
   *
   * @description
   * -1 for an array with undefined number of items
   * 1 for an non-array item
   **/
  nbValues: number;
}

/** Operator as specified in metadata */
export interface MetadataOperator {
  /** Unique ID of the operator */
  id: string;
  /** Fact description */
  description?: string;
  /** Display of the operator */
  display: string;
  /** Definition of the left operand */
  leftOperand: MetadataOperand;
  /** Definition of the right operand */
  rightOperand?: MetadataOperand;
  /** List of the names of the facts the operator depends on */
  factImplicitDependencies?: string[];
}

/** Action as specified in metadata */
export interface Action {
  /** Type of the action */
  type: string;
  /** Description of the action */
  description: string;
  /** Map of parameter with types */
  parameters?: Record<string, string>;
}
