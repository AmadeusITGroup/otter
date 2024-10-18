import {
  ParserConfig
} from '../interfaces/parser/parser-config';

/**
 * Represents a factory responsible to generate an IParserConfig
 */
export interface ParserFactory {
  /**
   * Returns the configuration to be used in the Parser
   */
  getConfig(): ParserConfig;
}
