/**
 * Model: ComponentProperty
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { ComponentPropertyBoundVariables } from '../component-property-bound-variables';
import { ComponentPropertyType } from '../component-property-type';
import { ComponentPropertyValue } from '../component-property-value';
import { InstanceSwapPreferredValue } from '../instance-swap-preferred-value';

/**
 * A property of a component.
 */
export interface ComponentProperty {
  /** @see ComponentPropertyType */
  type: ComponentPropertyType;
  /** @see ComponentPropertyValue */
  value: ComponentPropertyValue;
  /** Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`. */
  preferredValues?: InstanceSwapPreferredValue[];
  /** @see ComponentPropertyBoundVariables */
  boundVariables?: ComponentPropertyBoundVariables;
}


