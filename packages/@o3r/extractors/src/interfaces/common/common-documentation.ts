import { CommonDocumentationNode } from './common-documentation-node';

/**
 * Common documentation
 */
export interface CommonDocumentation {
  /** Map of entity types for common documentation */
  entityTypes: {[key: string]: CommonDocumentationNode[]};
}
