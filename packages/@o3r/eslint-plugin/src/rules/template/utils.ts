import {
  type ParserServices,
  TSESLint,
} from '@typescript-eslint/utils';

/** Position in source code */
interface SourceSpan {
  /** starting position */
  start: { line: number; col: any };

  /** ending position */
  end: { line: number; col: any };
}

/** Basic interface for the Parser Services object provided by @angular-eslint/template-parser */
type TemplateParserServices = ParserServices & {
  /** Set body visitor rule runner */
  convertElementSourceSpanToLoc: (listenerObj: any) => any;

  /** Determine the linter notification position based on the node */
  convertNodeSourceSpanToLoc: (sourceSpan: SourceSpan) => any;
};

/**
 * Determine if @angular-eslint/template-parser is used
 * @param parserServices Parser services object
 */
export function isTemplateParserServices(parserServices: any): parserServices is TemplateParserServices {
  return parserServices && (
    typeof parserServices.convertElementSourceSpanToLoc === 'function'
    || typeof parserServices.convertNodeSourceSpanToLoc === 'function'
  );
}

/**
 * Retrieve the template parser services object or throw if the invalid parser is used
 * @param context Rule context
 */
export function getTemplateParserServices(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>) {
  const parserService = context.sourceCode.parserServices;
  if (!isTemplateParserServices(parserService)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to @angular-eslint/template-parser
     */
    throw new Error(
      'You have used a rule which requires \'@angular-eslint/template-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
  return parserService;
}

/**
 * Utility for rule authors to ensure that their rule is correctly being used with @angular-eslint/template-parser
 * If @angular-eslint/template-parser is not the configured parser when the function is invoked it will throw
 * @param context
 */
export function ensureTemplateParser(context: Readonly<TSESLint.RuleContext<string, readonly unknown[]>>): void {
  if (!isTemplateParserServices(context.parserServices)) {
    /*
     * The user needs to have configured "parser" in their eslint config and set it
     * to @angular-eslint/template-parser
     */
    throw new Error(
      'You have used a rule which requires \'@angular-eslint/template-parser\' to be used as the \'parser\' in your ESLint config.'
    );
  }
}
