/**
 * Model: Component
 *
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. DO NOT EDIT.
 *
 */


import { DocumentationLink } from '../documentation-link';

/**
 * A description of a main component. Helps you identify which component instances are attached to.
 */
export interface Component {
  /** The key of the component */
  key: string;
  /** Name of the component */
  name: string;
  /** The description of the component as entered in the editor */
  description: string;
  /** The ID of the component set if the component belongs to one */
  componentSetId?: string;
  /** An array of documentation links attached to this component */
  documentationLinks: DocumentationLink[];
  /** Whether this component is a remote component that doesn't live in this file */
  remote: boolean;
}


