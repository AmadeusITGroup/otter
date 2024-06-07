/** Supported types for a fact */
export type FactSupportedTypes = 'string' | 'number' | 'date' | 'object' | 'boolean' | 'array';

/** Base metadata fact */
interface BaseMetadataFact {
  /** Name of the Fact */
  name: string;
  /** Fact description */
  description?: string;
  /** Type of the fact */
  type: FactSupportedTypes;
}

/** Metadata fact of type enum */
export interface EnumMetadataFact extends BaseMetadataFact {
  /** @inheritdoc */
  type: 'string';
  /** Set of values of enum of type string */
  enum: string[];
}

/** Metadata fact of type object */
export interface ObjectMetadataFact extends BaseMetadataFact {
  /** @inheritdoc */
  type: 'object';
  /** Path to schema file describing the complex file */
  schemaFile?: string;
}

/** Metadata fact of type array */
export interface ArrayMetadataFact extends BaseMetadataFact {
  /** @inheritdoc */
  type: 'array';
  /** Items in array */
  // eslint-disable-next-line no-use-before-define
  items: MetadataFact;
}

/** Metadata fact of type string, number, date, or boolean */
export interface OtherMetadataFact extends BaseMetadataFact {
  /** @inheritdoc */
  type: 'string' | 'number' | 'date' | 'boolean';
}

/** Fact as description in the metadata file */
export type MetadataFact = OtherMetadataFact | ObjectMetadataFact | EnumMetadataFact | ArrayMetadataFact;
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
