/**
 * Model: InstanceSwapPreferredValue
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */



/**
 * Instance swap preferred value.
 */
export interface InstanceSwapPreferredValue {
  /** Type of node for this preferred value. */
  type: TypeEnum;
  /** Key of this component or component set. */
  key: string;
}

/** Array of TypeEnum items */
export const LIST_TYPE_ENUM = ['COMPONENT', 'COMPONENT_SET'] as const;

/** List of available values for TypeEnum */
export type TypeEnum = 'COMPONENT' | 'COMPONENT_SET';

