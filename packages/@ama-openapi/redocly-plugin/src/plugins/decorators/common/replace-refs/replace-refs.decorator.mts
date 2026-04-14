import type {
  Async2Preprocessor,
  Async3Preprocessor,
  Oas2Preprocessor,
  Oas3Preprocessor,
} from '@redocly/openapi-core';

type Preprocessor = Oas2Preprocessor & Oas3Preprocessor & Async2Preprocessor & Async3Preprocessor;

interface RedirectCriteria {
  /** Pattern, or one of the listed patterns, the $ref url should match to apply the redirection */
  includeRefPatterns?: string | string[];
  /** Pattern, or one of the listed patterns, the $ref url should not match to apply the redirection */
  excludeRefPatterns?: string | string[];
  /** Detect if a specific `x-vendor` tag is present beside of the reference */
  hasTag?: string;
}

/** Rule to redirect the reference matching the criteria in the final specification */
export interface RedirectRule extends RedirectCriteria {
  /** Redirect the reference to a define URL */
  redirectUrl: string;
  /** Determine the final inner path should be kept */
  keepFinalInnerPath?: boolean;
}

/** Options for the RedirectRefs custom decorator */
export interface RedirectRefDecoratorOptions {
  /** Rules to be apply to the specification references */
  rules?: RedirectRule[];
}

/** Name of the redirectRef custom decorator */
export const DECORATOR_ID_REDIRECT_REF = 'redirect-ref';

const regExpify = (patterns: string | string[] | undefined) =>
  patterns
    ? (Array.isArray(patterns) ? patterns : [patterns])
      .map((pattern) => new RegExp(pattern))
    : undefined;

/**
 * Custom decorator to redirect the references in the final specification
 * @example Redirect specific model to external URL
 * ```yaml
 * plugins:
 *   - '@ama-openapi/redocly-plugin'
 *
 * apis:
 *   mySpec:
 *     root: apis/mySpec.json
 *     decorators:
 *       ama-openapi/redirect-ref:
 *         rules:
 *          - redirectUrl: "https://my-spec.website.com/"
 *            keepFinalInnerPath: true
 *            matchingRefPattern: "my-models/.*"
 * ```
 * @param options
 */
export const redirectRefsDecorator: Preprocessor = (options: RedirectRefDecoratorOptions) => {
  const rules = options.rules?.map((rule) => {
    return {
      ...rule,
      include: regExpify(rule.includeRefPatterns),
      exclude: regExpify(rule.excludeRefPatterns)
    };
  }) ?? [];
  const toRedirectMap = new Map<string, RedirectRule>();
  return {
    ref: {
      enter: (node, { parent, location }) => {
        const matchingRule = rules.find(({ include, exclude, hasTag }) =>
          ([include, exclude, hasTag].some((item) => !!item))
          && (!include || include.some((regExp) => node.$ref.match(regExp)))
          && (!exclude || !exclude.some((regExp) => node.$ref.match(regExp)))
          && (!hasTag || Object.values(parent).some((obj: any) => obj && typeof obj === 'object' && typeof obj[hasTag] !== 'undefined' && !!obj[hasTag]))
        );
        if (matchingRule) {
          toRedirectMap.set(location.absolutePointer, matchingRule);
        }
      },
      leave: (node, { location }) => {
        const toRedirect = toRedirectMap.get(location.absolutePointer);

        if (toRedirect) {
          node.$ref = toRedirect.redirectUrl + (toRedirect.keepFinalInnerPath ? node.$ref : '');
        }
      }
    }
  };
};
