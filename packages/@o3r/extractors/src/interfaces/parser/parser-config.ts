import {
  DocumentationOptions
} from './documentation-options';
import {
  FileOptions
} from './file-options';

/**
 * Config for the parser
 */
export interface ParserConfig {
  /**
   * Options related to the file discovery
   */
  fileOptions?: FileOptions;
  /**
   * Options related to the documentation building
   */
  documentationOptions?: DocumentationOptions;
  /**
   * Typedoc parsing options
   */
  typedoc?: any;
}
