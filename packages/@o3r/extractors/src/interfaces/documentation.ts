import {
  CommonDocumentation,
} from './common';
import {
  DocumentationNode,
} from './documentation-node';

/**
 * Documentation
 */
export interface Documentation extends CommonDocumentation {
  /** Map of entity types for documentation */
  entityTypes: { [key: string]: DocumentationNode[] };
}
