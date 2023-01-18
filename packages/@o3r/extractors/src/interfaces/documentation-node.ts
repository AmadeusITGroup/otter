import type {DeclarationReflection} from 'typedoc';
import {DocumentationNodeType} from './enums';
import {CommonDocumentationNode} from './common';

/**
 * Documentation node
 */
export interface DocumentationNode extends CommonDocumentationNode {
  /** Type of the documentation node */
  type?: DocumentationNodeType;

  /** Reflection of the documentation node */
  reflection?: DeclarationReflection;
}
