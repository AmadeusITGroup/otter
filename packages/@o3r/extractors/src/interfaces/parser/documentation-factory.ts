import {
  Documentation,
} from '../documentation';
import {
  DocumentationOptions,
} from './documentation-options';

/**
 * Documentation factory
 */
export interface DocumentationFactory {
  /**
   * Builds the documentation considering the options
   */
  build(documentation: Documentation, config?: DocumentationOptions): Documentation;

  /**
   * Serializes the documentation
   */
  serialize(documentation: Documentation): Documentation;
}
