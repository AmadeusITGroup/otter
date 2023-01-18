import type { ParserFactory } from '../core';
import type { ParserConfig } from '../interfaces';

/**
 * Common parser factory. Used for creating a parser configuration.
 */
export class CommonParserFactory implements ParserFactory {
  public getConfig() {
    return {
      documentationOptions: { includeFileContent: false }
    } as ParserConfig;
  }
}
