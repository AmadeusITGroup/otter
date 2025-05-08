/**
 * Model: ComponentSet
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DocumentationLink } from '../documentation-link';

/**
 * A description of a component set, which is a node containing a set of variants of a component.
 */
export interface ComponentSet {
  /** The key of the component set */
  key: string;
  /** Name of the component set */
  name: string;
  /** The description of the component set as entered in the editor */
  description: string;
  /** An array of documentation links attached to this component set */
  documentationLinks?: DocumentationLink[];
  /** Whether this component set is a remote component set that doesn't live in this file */
  remote?: boolean;
}


