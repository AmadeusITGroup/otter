import type {
  DeclarationReflection,
} from 'typedoc';
import {
  CommonDocumentationNode,
} from './common';
import {
  DocumentationNodeType,
} from './enums';

/**
 * Documentation node
 */
export interface DocumentationNode extends CommonDocumentationNode {
  /** Type of the documentation node */
  type?: DocumentationNodeType;

  /** Reflection of the documentation node */
  reflection?: DeclarationReflection;
}
