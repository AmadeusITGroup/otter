/**
 * Model: ComponentPropertyDefinition
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ComponentPropertyDefinitionDefaultValue } from '../component-property-definition-default-value';
import { ComponentPropertyType } from '../component-property-type';
import { InstanceSwapPreferredValue } from '../instance-swap-preferred-value';

/**
 * A property of a component.
 */
export interface ComponentPropertyDefinition {
  /** @see ComponentPropertyType */
  type: ComponentPropertyType;
  /** @see ComponentPropertyDefinitionDefaultValue */
  defaultValue: ComponentPropertyDefinitionDefaultValue;
  /** All possible values for this property. Only exists on VARIANT properties. */
  variantOptions?: string[];
  /** Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`. */
  preferredValues?: InstanceSwapPreferredValue[];
}


