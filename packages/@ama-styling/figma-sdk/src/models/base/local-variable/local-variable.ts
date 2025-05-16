/**
 * Model: LocalVariable
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { LocalVariableValuesByModeValue } from '../local-variable-values-by-mode-value';
import { VariableCodeSyntax } from '../variable-code-syntax';
import { VariableScope } from '../variable-scope';

/**
 * A Variable is a single design token that defines values for each of the modes in its VariableCollection. These values can be applied to various kinds of design properties.
 */
export interface LocalVariable {
  /** The unique identifier of this variable. */
  id: string;
  /** The name of this variable. */
  name: string;
  /** The key of this variable. */
  key: string;
  /** The id of the variable collection that contains this variable. */
  variableCollectionId: string;
  /** The resolved type of the variable. */
  resolvedType: ResolvedTypeEnum;
  /** The values for each mode of this variable. */
  valuesByMode: { [key: string]: LocalVariableValuesByModeValue; };
  /** Whether this variable is remote. */
  remote: boolean;
  /** The description of this variable. */
  description: string;
  /** Whether this variable is hidden when publishing the current file as a library.  If the parent `VariableCollection` is marked as `hiddenFromPublishing`, then this variable will also be hidden from publishing via the UI. `hiddenFromPublishing` is independently toggled for a variable and collection. However, both must be true for a given variable to be publishable. */
  hiddenFromPublishing: boolean;
  /** An array of scopes in the UI where this variable is shown. Setting this property will show/hide this variable in the variable picker UI for different fields.  Setting scopes for a variable does not prevent that variable from being bound in other scopes (for example, via the Plugin API). This only limits the variables that are shown in pickers within the Figma UI. */
  scopes: VariableScope[];
  /** @see VariableCodeSyntax */
  codeSyntax: VariableCodeSyntax;
  /** Indicates that the variable was deleted in the editor, but the document may still contain references to the variable. References to the variable may exist through bound values or variable aliases. */
  deletedButReferenced?: boolean;
}

export type ResolvedTypeEnum = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';

