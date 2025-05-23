/**
 * Model: VariableAlias
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Contains a variable alias
 */
export interface VariableAlias {
  /** @see TypeEnum */
  type: TypeEnum;
  /** The id of the variable that the current variable is aliased to. This variable can be a local or remote variable, and both can be retrieved via the GET /v1/files/:file_key/variables/local endpoint. */
  id: string;
}

export type TypeEnum = 'VARIABLE_ALIAS';

