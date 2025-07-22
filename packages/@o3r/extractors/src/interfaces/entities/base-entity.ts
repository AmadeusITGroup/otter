import {
  DocumentationNode,
} from '../documentation-node';

/**
 * Base entity
 */
export interface BaseEntity extends DocumentationNode {
  /** Entity source */
  source?: string;
  /** Entity readme */
  readme?: string;
  /** Entity developer */
  developer?: string;
}
