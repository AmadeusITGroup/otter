/**
 * Model: Style
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { StyleType } from '../style-type';

/**
 * A set of properties that can be applied to nodes and published. Styles for a property can be created in the corresponding property's panel while editing a file.
 */
export interface Style {
  /** The key of the style */
  key: string;
  /** Name of the style */
  name: string;
  /** Description of the style */
  description: string;
  /** Whether this style is a remote style that doesn't live in this file */
  remote: boolean;
  /** @see StyleType */
  styleType: StyleType;
}


