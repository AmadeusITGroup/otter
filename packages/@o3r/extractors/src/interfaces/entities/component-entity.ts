import {
  DocumentationNode
} from '../documentation-node';
import {
  BaseEntity
} from './base-entity';

/**
 * Component entity
 */
export interface ComponentEntity extends BaseEntity {
  template?: string;
  configuration?: DocumentationNode;
}
