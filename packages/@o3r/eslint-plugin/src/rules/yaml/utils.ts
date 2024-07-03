import { type ParserServices, TSESLint } from '@typescript-eslint/utils';

/** Basic interface for the Parser Services object provided by yaml-eslint-parser */
type YamlParserServices = ParserServices & {
  isYAML: boolean;
};

/**
 * Determine if yaml-eslint-parser is used
 * @param parserServices Parser services object
 */
export function isYamlParserServices(parserServices: any): parserServices is YamlParserServices {
  return !!parserServices && parserServices.isYAML;
}

/**
 * Retrieve the yaml parser services object or throw if the invalid parser is used
 * @param context Rule context
 */
export function getYamlParserServices(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>) {
  const parserService = context.parserServices;
  if (!isYamlParserServices(parserService)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to yaml-eslint-parser
     */
    throw new Error(
      'You have used a rule which requires \'yaml-eslint-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
  return parserService;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with yaml-eslint-parser
 * If yaml-eslint-parser is not the configured parser when the function is invoked it will throw
 * @param context
 */
export function ensureJsoncParser(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>): void {
  if (!(context.parserServices)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to yaml-eslint-parser
     */
    throw new Error(
      'You have used a rule which requires \'yaml-eslint-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
}
