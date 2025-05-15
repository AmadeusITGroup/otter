/**
 * Model: VariableCreate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableCodeSyntax } from '../variable-code-syntax';
import { VariableScope } from '../variable-scope';

/**
 * An object that contains details about creating a `Variable`.
 */
export interface VariableCreate {
  /** The action to perform for the variable. */
  action: ActionEnum;
  /** A temporary id for this variable. */
  id?: string;
  /** The name of this variable. */
  name: string;
  /** The variable collection that will contain the variable. You can use the temporary id of a variable collection. */
  variableCollectionId: string;
  /** The resolved type of the variable. */
  resolvedType: ResolvedTypeEnum;
  /** The description of this variable. */
  description?: string;
  /** Whether this variable is hidden when publishing the current file as a library. */
  hiddenFromPublishing?: boolean;
  /** An array of scopes in the UI where this variable is shown. Setting this property will show/hide this variable in the variable picker UI for different fields. */
  scopes?: VariableScope[];
  /** @see VariableCodeSyntax */
  codeSyntax?: VariableCodeSyntax;
}

export type ActionEnum = 'CREATE';
export type ResolvedTypeEnum = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

