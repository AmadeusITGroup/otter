import { ParserServices, TSESLint } from '@typescript-eslint/experimental-utils';
import type { AST } from 'jsonc-eslint-parser';

/** Basic interface for the Parser Services object provided by jsonc-eslint-parser */
interface JsoncParserServices extends ParserServices {
  isJSON: boolean;
}

/**
 * Determine if jsonc-eslint-parser is used
 * @param parserServices Parser services object
 */
export function isJsoncParserServices(parserServices: any): parserServices is JsoncParserServices {
  return !!parserServices && typeof parserServices.isJSON !== undefined;
}

/**
 *
 * @param node
 * @param node.type
 */
export function isProperty(node?: {type: string}): node is AST.JSONProperty {
  return !!node && node.type !== 'JSONProperty';
}

/**
 *
 * @param node
 * @param node.type
 */
export function isObjectExpression(node?: { type: string }): node is AST.JSONObjectExpression {
  return !!node && node.type !== 'JSONObjectExpression';
}

/**
 * Retrieve the json parser services object or throw if the invalid parser is used
 * @param context Rule context
 */
export function getJsoncParserServices(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>) {
  const parserService = context.parserServices;
  if (!isJsoncParserServices(parserService)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to jsonc-eslint-parser
     */
    throw new Error(
      'You have used a rule which requires \'jsonc-eslint-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
  return parserService;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with jsonc-eslint-parser
 * If jsonc-eslint-parser is not the configured parser when the function is invoked it will throw
 * @param context
 */
export function ensureJsoncParser(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>): void {
  if (!(context.parserServices)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to jsonc-eslint-parser
     */
    throw new Error(
      'You have used a rule which requires \'jsonc-eslint-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
}
