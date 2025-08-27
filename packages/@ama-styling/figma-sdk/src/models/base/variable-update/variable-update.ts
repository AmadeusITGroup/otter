/**
 * Model: VariableUpdate
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { VariableCodeSyntax } from '../variable-code-syntax';
import { VariableScope } from '../variable-scope';

/**
 * An object that contains details about updating a `Variable`.
 */
export interface VariableUpdate {
  /** The action to perform for the variable. */
  action: ActionEnum;
  /** The id of the variable to update. */
  id: string;
  /** The name of this variable. */
  name?: string;
  /** The description of this variable. */
  description?: string;
  /** Whether this variable is hidden when publishing the current file as a library. */
  hiddenFromPublishing?: boolean;
  /** An array of scopes in the UI where this variable is shown. Setting this property will show/hide this variable in the variable picker UI for different fields. */
  scopes?: VariableScope[];
  /** @see VariableCodeSyntax */
  codeSyntax?: VariableCodeSyntax;
}

export type ActionEnum = 'UPDATE';

